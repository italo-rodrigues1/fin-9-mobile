const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('fs'),
  path = require('path'),
  Module = require('module'),
  ts = require('typescript');
function harness(storage) {
  const modules = new Map();
  function load(relative) {
    const file = path.resolve(__dirname, '../src', relative);
    if (modules.has(file)) return modules.get(file).exports;
    const mod = new Module(file, module);
    mod.filename = file;
    mod.paths = Module._nodeModulePaths(path.dirname(file));
    modules.set(file, mod);
    mod.require = function (id) {
      if (id === '@react-native-async-storage/async-storage')
        return { default: storage };
      if (id.startsWith('.'))
        return load(
          path.relative(
            path.resolve(__dirname, '../src'),
            path.resolve(path.dirname(file), id) + '.ts',
          ),
        );
      return Module.prototype.require.call(this, id);
    };
    mod._compile(
      ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      file,
    );
    return mod.exports;
  }
  return load;
}
const { palettes, resolveTheme, themeVariables } = harness({})(
  'theme/palette.ts',
);
test('appearance respects manual choice and falls back to the current system preference', () => {
  assert.equal(resolveTheme('dark', 'light'), 'dark');
  assert.equal(resolveTheme('light', 'dark'), 'light');
  assert.equal(resolveTheme('system', 'dark'), 'dark');
  assert.equal(resolveTheme('system', null), 'light');
});
test('light and dark palettes expose matching native and web semantic variables', () => {
  assert.deepEqual(Object.keys(palettes.light), Object.keys(palettes.dark));
  assert.equal(themeVariables(palettes.dark)['--app-background'], '11 18 32');
  assert.ok(
    Object.values(themeVariables(palettes.light)).every((v) =>
      /^\d+ \d+ \d+$/.test(v),
    ),
  );
});
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test('core financial text and button labels retain readable contrast in both themes', () => {
  for (const palette of Object.values(palettes)) {
    for (const text of ['text', 'textSecondary', 'textMuted', 'primaryText'])
      assert.ok(contrast(palette[text], palette.surface) >= 4.5, text);
    assert.ok(contrast(palette.onPrimary, palette.primary) >= 4.5);
    assert.ok(contrast(palette.onPrimary, palette.dangerSolid) >= 4.5);
  }
});
test('the selected appearance survives store recreation and subsequent changes', async () => {
  let saved = 'dark';
  const storage = {
    getItem: async () => saved,
    setItem: async (k, v) => {
      saved = v;
    },
  };
  let store = harness(storage)('stores/themeStore.ts').useThemeStore;
  await store.getState().hydrate();
  assert.equal(store.getState().preference, 'dark');
  await store.getState().setPreference('light');
  store = harness(storage)('stores/themeStore.ts').useThemeStore;
  await store.getState().hydrate();
  assert.equal(store.getState().preference, 'light');
});
test('rapid appearance changes are saved in the requested order', async () => {
  const writes = [];
  const storage = {
      getItem: async () => null,
      setItem: async (k, v) => writes.push(v),
    },
    store = harness(storage)('stores/themeStore.ts').useThemeStore;
  await Promise.all([
    store.getState().setPreference('dark'),
    store.getState().setPreference('light'),
    store.getState().setPreference('system'),
  ]);
  assert.deepEqual(writes, ['dark', 'light', 'system']);
  assert.equal(store.getState().preference, 'system');
});
