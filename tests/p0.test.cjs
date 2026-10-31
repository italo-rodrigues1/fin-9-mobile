const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(relative) {
  const filename = path.resolve(__dirname, '../src', relative);
  const module = new Module(filename, moduleParent());
  module.filename = filename;
  module.paths = Module._nodeModulePaths(path.dirname(filename));
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
  return module.exports;
}
function moduleParent() {
  return module;
}
const format = load('utils/format.ts');
const { errorMessage } = load('utils/errorMessage.ts');
const { usePrivacyStore } = load('stores/privacyStore.ts');
test('calendar dates retain their day in negative and positive time zones', () => {
  const before = process.env.TZ;
  try {
    for (const zone of [
      'America/Sao_Paulo',
      'America/Los_Angeles',
      'Asia/Tokyo',
    ]) {
      process.env.TZ = zone;
      assert.match(format.formatDate('2027-01-01T00:00:00.000Z'), /01.*2027/);
      assert.match(format.formatDateShort('2028-02-29'), /29/);
      assert.match(format.formatDateShort('2026-10-31'), /31/);
    }
  } finally {
    if (before) process.env.TZ = before;
    else delete process.env.TZ;
  }
});
test('Brazilian monetary input preserves cents and grouping', () => {
  for (const amount of [0, 0.01, 0.1, 32.5, 1250.35, 999999999.99])
    assert.equal(
      format.parseCurrencyInput(format.formatCurrencyInput(amount)),
      amount,
    );
  assert.equal(format.sanitizeCurrencyInput('1.234,567'), '1.234,56');
});
test('privacy toggles a shared preference without storing balances', () => {
  assert.equal(usePrivacyStore.getState().showValues, true);
  usePrivacyStore.getState().toggle();
  assert.equal(usePrivacyStore.getState().showValues, false);
  usePrivacyStore.getState().toggle();
  assert.equal(usePrivacyStore.getState().showValues, true);
});
test('API errors render validation arrays, connection failures, and fallback messages', () => {
  assert.equal(
    errorMessage(
      {
        response: { data: { message: ['Nome obrigatório', 'Senha inválida'] } },
      },
      'Erro',
    ),
    'Nome obrigatório\nSenha inválida',
  );
  assert.match(errorMessage({ request: {} }, 'Erro'), /conexão/);
  assert.equal(errorMessage({}, 'Erro ao salvar'), 'Erro ao salvar');
});
