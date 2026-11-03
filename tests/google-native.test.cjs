const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const WEB_CLIENT_ID = '123-native-test.apps.googleusercontent.com';
const IOS_CLIENT_ID = '123-ios-test.apps.googleusercontent.com';

function harness(t, options = {}) {
  const previousWebId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const previousIosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = WEB_CLIENT_ID;
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = IOS_CLIENT_ID;
  t.after(() => {
    if (previousWebId === undefined)
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    else process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = previousWebId;
    if (previousIosId === undefined)
      delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    else process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = previousIosId;
  });

  const calls = {
    registry: [],
    sdkImports: 0,
    fatalImports: 0,
    configured: [],
    operations: [],
    playServicesOptions: [],
  };
  const statusCodes = {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  };
  const GoogleSignin = {
    configure(configuration) {
      calls.configured.push(configuration);
      calls.operations.push('configure');
    },
    async hasPlayServices(configuration) {
      calls.playServicesOptions.push(configuration);
      calls.operations.push('playServices');
      if (options.playServicesError) throw options.playServicesError;
      return true;
    },
    async signOut() {
      calls.operations.push('signOut');
    },
    async signIn() {
      calls.operations.push('signIn');
      if (options.signInError) throw options.signInError;
      return (
        options.response ?? {
          type: 'success',
          data: { idToken: 'verified-by-backend-later' },
        }
      );
    },
  };
  const modules = new Map();
  function load(relative) {
    const filename = path.resolve(__dirname, '../src', relative);
    if (modules.has(filename)) return modules.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    modules.set(filename, mod);
    mod.require = function (id) {
      if (id === 'expo-constants')
        return {
          __esModule: true,
          default: {
            executionEnvironment: options.expoGo ? 'storeClient' : 'bare',
          },
          ExecutionEnvironment: { StoreClient: 'storeClient' },
        };
      if (id === 'react-native')
        return {
          Platform: { OS: options.platform ?? 'android' },
          TurboModuleRegistry: {
            get(name) {
              calls.registry.push(name);
              return options.modulePresent === false ? null : {};
            },
          },
        };
      if (id === '@react-native-google-signin/google-signin') {
        calls.sdkImports++;
        // Importing this SDK in a stale native binary reaches getEnforcing.
        // The preflight must avoid importing it, rather than relying on catch.
        if (options.modulePresent === false) {
          calls.fatalImports++;
          throw new Error('RNGoogleSignin could not be found');
        }
        return {
          GoogleSignin,
          statusCodes,
          isErrorWithCode: (error) =>
            error !== null && typeof error === 'object' && 'code' in error,
        };
      }
      if (id.startsWith('.'))
        return load(
          path.relative(
            path.resolve(__dirname, '../src'),
            path.resolve(path.dirname(filename), id) + '.ts',
          ),
        );
      return Module.prototype.require.call(this, id);
    };
    mod._compile(
      ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
      }).outputText,
      filename,
    );
    return mod.exports;
  }
  const { googleAuth } = load('services/googleAuth.ts');
  return { googleAuth, calls, statusCodes };
}

test('Expo Go reports the unsupported build without importing the native Google SDK', async (t) => {
  const { googleAuth, calls } = harness(t, {
    expoGo: true,
    modulePresent: false,
  });
  await assert.rejects(googleAuth.signIn(), /Expo Go/);
  assert.equal(calls.sdkImports, 0);
  assert.equal(calls.fatalImports, 0);
  assert.deepEqual(calls.configured, []);
});

test('an older development binary fails before importing a missing RNGoogleSignin module', async (t) => {
  const { googleAuth, calls } = harness(t, { modulePresent: false });
  await assert.rejects(googleAuth.signIn(), /versão|build|instal/i);
  assert.deepEqual(calls.registry, ['RNGoogleSignin']);
  assert.equal(calls.sdkImports, 0);
  assert.equal(calls.fatalImports, 0);
  assert.deepEqual(calls.configured, []);
  assert.deepEqual(calls.operations, []);
});

test('a native Google module is configured before opening sign-in and returns only its ID token', async (t) => {
  const { googleAuth, calls } = harness(t);
  assert.equal(await googleAuth.signIn(), 'verified-by-backend-later');
  assert.deepEqual(calls.registry, ['RNGoogleSignin']);
  assert.equal(calls.sdkImports, 1);
  assert.deepEqual(calls.configured, [
    {
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      offlineAccess: false,
    },
  ]);
  assert.deepEqual(calls.operations, [
    'configure',
    'playServices',
    'signOut',
    'signIn',
  ]);
  assert.deepEqual(calls.playServicesOptions, [
    { showPlayServicesUpdateDialog: true },
  ]);
});

test('cancelling native sign-in returns null without a credential', async (t) => {
  const { googleAuth } = harness(t, {
    response: { type: 'cancelled', data: null },
  });
  assert.equal(await googleAuth.signIn(), null);
});

test('signing out before Google initialization does not import the native SDK', async (t) => {
  const { googleAuth, calls } = harness(t, { modulePresent: false });
  await googleAuth.signOut();
  assert.equal(calls.sdkImports, 0);
  assert.deepEqual(calls.registry, []);
  assert.deepEqual(calls.operations, []);
});

test('unavailable Play Services produces a friendly error before sign-in', async (t) => {
  const { googleAuth, calls } = harness(t, {
    playServicesError: { code: 'PLAY_SERVICES_NOT_AVAILABLE' },
  });
  await assert.rejects(googleAuth.signIn(), /Atualize o Google Play Services/);
  assert.deepEqual(calls.operations, ['configure', 'playServices']);
});

test('iOS uses its native Google module without checking Android Play Services', async (t) => {
  const { googleAuth, calls } = harness(t, { platform: 'ios' });
  assert.equal(await googleAuth.signIn(), 'verified-by-backend-later');
  assert.deepEqual(calls.operations, ['configure', 'signOut', 'signIn']);
  assert.deepEqual(calls.playServicesOptions, []);
});
