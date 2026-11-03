const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const session = {
  user: {
    id: 'fin9-user',
    name: 'Nome salvo no Fin-9',
    email: 'person@example.com',
  },
  token: 'fin9-session-jwt',
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function harness(overrides = {}) {
  const calls = {
    requests: [],
    writes: [],
    removals: [],
    resets: [],
    signIn: 0,
    signOut: 0,
  };
  const api = {
    post: async (url, body) => {
      calls.requests.push({ url, body });
      return overrides.post ? overrides.post(url, body) : { data: session };
    },
  };
  const googleAuth = {
    signIn: async () => {
      calls.signIn++;
      return overrides.signIn ? overrides.signIn() : 'google-identity-token';
    },
    signOut: async () => {
      calls.signOut++;
      if (overrides.signOut) return overrides.signOut();
    },
  };
  const tokenStorage = {
    getItem: async () => null,
    setItem: async (key, value) => {
      calls.writes.push({ key, value });
      if (overrides.setItem) return overrides.setItem(key, value);
    },
    removeItem: async (key) => {
      calls.removals.push(key);
    },
  };
  const sourceRoot = path.resolve(__dirname, '../src');
  const modules = new Map();
  const stubs = new Map([
    ['services/api.ts', { default: api }],
    ['services/googleAuth.ts', { googleAuth }],
    [
      'services/tokenStorage.ts',
      { AUTH_TOKEN_KEY: 'auth_token', tokenStorage },
    ],
  ]);
  for (const name of ['Category', 'Account', 'Transaction']) {
    stubs.set(`stores/${name[0].toLowerCase()}${name.slice(1)}Store.ts`, {
      [`use${name}Store`]: {
        getState: () => ({ reset: () => calls.resets.push(name) }),
      },
    });
  }
  function load(relative) {
    const filename = path.resolve(sourceRoot, relative);
    const normalized = path
      .relative(sourceRoot, filename)
      .replaceAll('\\', '/');
    if (stubs.has(normalized)) return stubs.get(normalized);
    if (modules.has(filename)) return modules.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    modules.set(filename, mod);
    mod.require = function (id) {
      if (id.startsWith('.')) {
        return load(
          path.relative(
            sourceRoot,
            path.resolve(path.dirname(filename), id) + '.ts',
          ),
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
  const store = load('stores/authStore.ts').useAuthStore;
  store.setState({ isLoading: false, isHydrated: true });
  return { store, calls, load };
}

test('Google sign-in posts only the provider token and saves only the Fin-9 session', async () => {
  const { store, calls } = harness();
  await store.getState().loginWithGoogle();
  assert.equal(calls.signIn, 1);
  assert.deepEqual(calls.requests, [
    { url: '/auth/google', body: { idToken: 'google-identity-token' } },
  ]);
  assert.deepEqual(calls.writes, [{ key: 'auth_token', value: session.token }]);
  assert.deepEqual(store.getState().user, session.user);
  assert.equal(store.getState().token, session.token);
  assert.equal(store.getState().isAuthenticated, true);
  assert.equal(store.getState().isLoading, false);
});

test('a credential supplied by the web button bypasses native Google sign-in', async () => {
  const { store, calls } = harness({
    signIn: () => assert.fail('native SDK must not run on a web callback'),
  });
  await store.getState().loginWithGoogle('web-google-credential');
  assert.equal(calls.signIn, 0);
  assert.deepEqual(calls.requests, [
    { url: '/auth/google', body: { idToken: 'web-google-credential' } },
  ]);
  assert.equal(store.getState().isAuthenticated, true);
});

test('cancelling Google returns to an idle form without an API request or error', async () => {
  const { store, calls } = harness({ signIn: async () => null });
  store.setState({ error: 'Erro de uma tentativa anterior' });
  await store.getState().loginWithGoogle();
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().error, null);
  assert.deepEqual(calls.requests, []);
  assert.deepEqual(calls.writes, []);
});

test('authentication becomes visible only after the Fin-9 JWT is persisted', async () => {
  const saving = deferred();
  const started = deferred();
  const { store } = harness({
    setItem: () => {
      started.resolve();
      return saving.promise;
    },
  });
  const attempt = store.getState().loginWithGoogle('google-credential');
  await started.promise;
  assert.equal(store.getState().isLoading, true);
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().token, null);
  assert.equal(store.getState().user, null);
  saving.resolve();
  await attempt;
  assert.equal(store.getState().isAuthenticated, true);
});

test('a storage failure cannot establish an authenticated session', async () => {
  const { store } = harness({
    setItem: async () => {
      throw new Error('storage unavailable');
    },
  });
  await assert.rejects(store.getState().loginWithGoogle('google-credential'));
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().token, null);
  assert.equal(store.getState().user, null);
  assert.equal(store.getState().isLoading, false);
  assert.equal(typeof store.getState().error, 'string');
});

test('a rejected backend identity never persists a token or trusts the Google profile', async () => {
  const message = 'Não foi possível validar a conta Google';
  const { store, calls } = harness({
    post: async () => {
      throw { response: { status: 401, data: { message } } };
    },
  });
  await assert.rejects(
    store.getState().loginWithGoogle('invalid-google-token'),
    { message },
  );
  assert.deepEqual(calls.writes, []);
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().user, null);
  assert.equal(store.getState().token, null);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().error, message);
});

test('while the Google picker is open, repeated and competing sign-in actions are ignored', async () => {
  const picker = deferred();
  const { store, calls } = harness({ signIn: () => picker.promise });
  const attempt = store.getState().loginWithGoogle();
  const competing = Promise.all([
    store.getState().loginWithGoogle(),
    store.getState().loginWithGoogle('another-credential'),
    store.getState().login('person@example.com', 'Password1'),
    store.getState().register('Pessoa', 'person@example.com', 'Password1'),
  ]);
  try {
    assert.equal(calls.signIn, 1);
    assert.deepEqual(calls.requests, []);
  } finally {
    picker.resolve(null);
    await Promise.all([attempt, competing]);
  }
  assert.equal(store.getState().isLoading, false);
});

for (const firstAction of ['login', 'register', 'loginWithGoogle']) {
  test(`${firstAction} holds the shared submit lock until the API request completes`, async () => {
    const pending = deferred();
    const started = deferred();
    const { store, calls } = harness({
      post: () => {
        started.resolve();
        return pending.promise;
      },
    });
    const actions = {
      login: () => store.getState().login('person@example.com', 'Password1'),
      register: () =>
        store.getState().register('Pessoa', 'person@example.com', 'Password1'),
      loginWithGoogle: () =>
        store.getState().loginWithGoogle('google-credential'),
    };
    const attempt = actions[firstAction]();
    await started.promise;
    const competing = Promise.all(Object.values(actions).map((run) => run()));
    try {
      assert.equal(calls.requests.length, 1);
      assert.equal(calls.signIn, 0);
    } finally {
      pending.resolve({ data: session });
      await Promise.all([attempt, competing]);
    }
    assert.equal(store.getState().isAuthenticated, true);
    assert.equal(store.getState().isLoading, false);
  });
}

test('Google sign-out failure does not preserve the Fin-9 JWT or financial state', async () => {
  const { store, calls } = harness({
    signOut: async () => {
      throw new Error('Google unavailable');
    },
  });
  store.setState({
    user: session.user,
    token: session.token,
    isAuthenticated: true,
  });
  await store.getState().logout();
  assert.equal(calls.signOut, 1);
  assert.deepEqual(calls.removals, ['auth_token']);
  assert.deepEqual(calls.resets.sort(), ['Account', 'Category', 'Transaction']);
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().user, null);
  assert.equal(store.getState().token, null);
  assert.equal(store.getState().error, null);
});

function withGoogleEnvironment(values, run) {
  const keys = [
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  try {
    for (const key of keys) {
      if (values[key] === undefined) delete process.env[key];
      else process.env[key] = values[key];
    }
    return run();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

const webClientId = '1234567890-webabcdef123456.apps.googleusercontent.com';
const iosClientId = '1234567890-iosabcdef123456.apps.googleusercontent.com';

test('Google configuration uses the Web audience and the separate iOS client', () => {
  withGoogleEnvironment(
    {
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webClientId,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: iosClientId,
    },
    () => {
      const { getGoogleConfiguration } = harness().load(
        'services/googleConfig.ts',
      );
      assert.equal(getGoogleConfiguration('android').webClientId, webClientId);
      assert.equal(getGoogleConfiguration('web').webClientId, webClientId);
      assert.deepEqual(getGoogleConfiguration('ios'), {
        webClientId,
        iosClientId,
      });
    },
  );
});

test('iOS requires its own OAuth client while web and Android can use only the Web client', () => {
  withGoogleEnvironment(
    { EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webClientId },
    () => {
      const { getGoogleConfiguration } = harness().load(
        'services/googleConfig.ts',
      );
      assert.equal(getGoogleConfiguration('android').webClientId, webClientId);
      assert.equal(getGoogleConfiguration('web').webClientId, webClientId);
      assert.throws(
        () => getGoogleConfiguration('ios'),
        /Google|google|configura/,
      );
    },
  );
});

test('an iOS client never substitutes for the missing Web token audience', () => {
  withGoogleEnvironment(
    { EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: iosClientId },
    () => {
      const { getGoogleConfiguration } = harness().load(
        'services/googleConfig.ts',
      );
      for (const platform of ['android', 'web', 'ios']) {
        assert.throws(
          () => getGoogleConfiguration(platform),
          /Google|google|configura/,
        );
      }
    },
  );
});

test('Google configuration reads changed environment values at call time', () => {
  withGoogleEnvironment(
    { EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webClientId },
    () => {
      const { getGoogleConfiguration } = harness().load(
        'services/googleConfig.ts',
      );
      assert.equal(getGoogleConfiguration('web').webClientId, webClientId);
      const secondClientId =
        '9876543210-otherabcdef123456.apps.googleusercontent.com';
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = secondClientId;
      assert.equal(getGoogleConfiguration('web').webClientId, secondClientId);
    },
  );
});
