const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { webcrypto } = require('node:crypto');
const ts = require('typescript');

const clientId = '1234567890-webabcdef123456.apps.googleusercontent.com';

// These credentials exercise browser-attempt routing only. Cryptographic token
// verification belongs to the backend and is intentionally not mocked here.
function credential(nonce) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString(
    'base64url',
  );
  const claims = Buffer.from(
    JSON.stringify({ nonce, name: 'Google profile' }),
  ).toString('base64url');
  return `${header}.${claims}.test-signature`;
}

function receiver() {
  const credentials = [];
  const errors = [];
  return {
    credentials,
    errors,
    handlers: {
      credential: (token) => credentials.push(token),
      error: (error) => errors.push(error),
    },
  };
}

function element(width = 300) {
  return {
    clientWidth: width,
    clears: 0,
    replaceChildren() {
      this.clears++;
    },
  };
}

function harness(t, { ready = true } = {}) {
  const initialized = [];
  const rendered = [];
  const observers = [];
  const scripts = [];
  const identity = {
    initialize: (options) => initialized.push(options),
    renderButton: (target, options) => rendered.push({ target, ...options }),
    disableAutoSelect() {},
  };
  const fakeWindow = ready ? { google: { accounts: { id: identity } } } : {};
  const fakeDocument = {
    createElement: (tag) => {
      assert.equal(tag, 'script');
      return {
        removed: false,
        remove() {
          this.removed = true;
        },
      };
    },
    head: { appendChild: (script) => scripts.push(script) },
  };
  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.observed = [];
      this.disconnected = false;
      observers.push(this);
    }
    observe(target) {
      this.observed.push(target);
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  const replacements = {
    window: fakeWindow,
    document: fakeDocument,
    crypto: webcrypto,
    ResizeObserver: FakeResizeObserver,
  };
  const previous = new Map();
  for (const [name, value] of Object.entries(replacements)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value,
    });
  }
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });

  const root = path.resolve(__dirname, '../src');
  const modules = new Map();
  function load(relative) {
    const filename = path.resolve(root, relative);
    if (modules.has(filename)) return modules.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    modules.set(filename, mod);
    mod.require = function (id) {
      if (id.startsWith('.')) {
        return load(
          path.relative(root, path.resolve(path.dirname(filename), id) + '.ts'),
        );
      }
      return Module.prototype.require.call(this, id);
    };
    mod._compile(
      ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      filename,
    );
    return mod.exports;
  }
  return {
    ...load('services/googleIdentity.web.ts'),
    initialized,
    rendered,
    observers,
    scripts,
    identity,
    fakeWindow,
  };
}

test('Google credentials without an explicit button click are ignored', async (t) => {
  const h = harness(t);
  const target = receiver();
  const dispose = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    false,
    target.handlers,
  );
  t.after(dispose);
  const setup = h.initialized.at(-1);
  setup.callback({ credential: credential(setup.nonce) });
  assert.deepEqual(target.credentials, []);
  assert.deepEqual(target.errors, []);
});

test('a clicked Google button delivers only its matching ID token once', async (t) => {
  const h = harness(t);
  const target = receiver();
  const dispose = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    false,
    target.handlers,
  );
  t.after(dispose);
  const setup = h.initialized.at(-1);
  assert.equal(setup.auto_select, false);
  assert.equal(setup.button_auto_select, false);
  assert.equal(setup.ux_mode, 'popup');
  const token = credential(setup.nonce);
  h.rendered.at(-1).click_listener();
  setup.callback({ credential: token });
  setup.callback({ credential: token });
  assert.deepEqual(target.credentials, [token]);
  assert.deepEqual(target.errors, []);
});

test('a response carrying another nonce cannot authenticate or consume the current attempt', async (t) => {
  const h = harness(t);
  const target = receiver();
  const dispose = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    false,
    target.handlers,
  );
  t.after(dispose);
  const setup = h.initialized.at(-1);
  h.rendered.at(-1).click_listener();
  setup.callback({ credential: credential('other-browser-attempt') });
  assert.deepEqual(target.credentials, []);
  const validToken = credential(setup.nonce);
  setup.callback({ credential: validToken });
  assert.deepEqual(target.credentials, [validToken]);
});

for (const [name, token] of [
  ['a malformed token', 'not-a-jwt'],
  ['a token with invalid JSON claims', 'header.bm90LWpzb24.signature'],
]) {
  test(`Google rejects ${name} without authenticating`, async (t) => {
    const h = harness(t);
    const target = receiver();
    const dispose = await h.mountGoogleIdentityButton(
      element(),
      clientId,
      false,
      target.handlers,
    );
    t.after(dispose);
    h.rendered.at(-1).click_listener();
    h.initialized.at(-1).callback({ credential: token });
    assert.deepEqual(target.credentials, []);
    assert.equal(target.errors.length, 1);
    assert.ok(target.errors[0] instanceof Error);
    assert.match(target.errors[0].message, /Google/);
    assert.ok(!target.errors[0].message.includes(token));
  });
}

test('unmounting a button discards a late credential and disconnects resize observation', async (t) => {
  const h = harness(t);
  const target = receiver();
  const host = element();
  const dispose = await h.mountGoogleIdentityButton(
    host,
    clientId,
    false,
    target.handlers,
  );
  const setup = h.initialized.at(-1);
  h.rendered.at(-1).click_listener();
  assert.deepEqual(h.observers[0].observed, [host]);
  const clearsBeforeDispose = host.clears;
  dispose();
  assert.equal(h.observers[0].disconnected, true);
  assert.equal(host.clears, clearsBeforeDispose + 1);
  setup.callback({ credential: credential(setup.nonce) });
  assert.deepEqual(target.credentials, []);
  assert.deepEqual(target.errors, []);
});

test('a stale button click cannot authorize the receiver of a newly mounted button', async (t) => {
  const h = harness(t);
  const first = receiver();
  const disposeFirst = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    false,
    first.handlers,
  );
  const oldClick = h.rendered.at(-1).click_listener;
  disposeFirst();
  const second = receiver();
  const disposeSecond = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    true,
    second.handlers,
  );
  t.after(disposeSecond);
  oldClick();
  const setup = h.initialized.at(-1);
  setup.callback({ credential: credential(setup.nonce) });
  assert.deepEqual(first.credentials, []);
  assert.deepEqual(second.credentials, []);
  assert.deepEqual(second.errors, []);
});

test('a response from an earlier mounted button cannot complete or consume the new receiver attempt', async (t) => {
  const h = harness(t);
  const first = receiver();
  const disposeFirst = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    false,
    first.handlers,
  );
  const oldSetup = h.initialized.at(-1);
  const oldToken = credential(oldSetup.nonce);
  h.rendered.at(-1).click_listener();
  disposeFirst();

  const second = receiver();
  const disposeSecond = await h.mountGoogleIdentityButton(
    element(),
    clientId,
    false,
    second.handlers,
  );
  t.after(disposeSecond);
  const newSetup = h.initialized.at(-1);
  h.rendered.at(-1).click_listener();
  oldSetup.callback({ credential: oldToken });
  // GIS owns one global callback; a late response may also arrive at its
  // latest registered handler instead of the original closure.
  newSetup.callback({ credential: oldToken });
  assert.deepEqual(first.credentials, []);
  assert.deepEqual(second.credentials, []);
  assert.deepEqual(second.errors, []);
  const newToken = credential(newSetup.nonce);
  newSetup.callback({ credential: newToken });
  assert.deepEqual(second.credentials, [newToken]);
});

test('the Google button follows its container width and disconnects the observer on disposal', async (t) => {
  const h = harness(t);
  const target = receiver();
  const host = element(240);
  const dispose = await h.mountGoogleIdentityButton(
    host,
    clientId,
    true,
    target.handlers,
  );
  assert.equal(h.rendered.at(-1).width, 240);
  assert.equal(h.rendered.at(-1).theme, 'filled_black');
  host.clientWidth = 360;
  h.observers[0].callback();
  assert.equal(h.rendered.at(-1).width, 360);
  dispose();
  assert.equal(h.observers[0].disconnected, true);
});

test('a failed Google script load can be retried without duplicate parallel downloads', async (t) => {
  const h = harness(t, { ready: false });
  const first = h.loadGoogleIdentity();
  const duplicate = h.loadGoogleIdentity();
  assert.equal(first, duplicate);
  assert.equal(h.scripts.length, 1);
  const rejected = assert.rejects(first, /carregar o Google/);
  h.scripts[0].onerror();
  await rejected;
  assert.equal(h.scripts[0].removed, true);

  const retry = h.loadGoogleIdentity();
  assert.equal(h.scripts.length, 2);
  h.fakeWindow.google = { accounts: { id: h.identity } };
  h.scripts[1].onload();
  assert.equal(await retry, h.identity);
});
