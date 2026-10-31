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

const { useConfirmationStore } = load('stores/confirmationStore.ts');
test('confirmation cancellation resolves false and clears the pending dialog', async () => {
  const pending = useConfirmationStore
    .getState()
    .ask('Sair', 'Encerrar a sessão?', 'Sair');
  assert.equal(useConfirmationStore.getState().request.title, 'Sair');
  useConfirmationStore.getState().answer(false);
  assert.equal(await pending, false);
  assert.equal(useConfirmationStore.getState().request, null);
});
test('repeated taps do not replace an outstanding confirmation', async () => {
  const first = useConfirmationStore
    .getState()
    .ask('Sair', 'Encerrar a sessão?', 'Sair');
  assert.equal(
    await useConfirmationStore
      .getState()
      .ask('Outra ação', 'Teste', 'Continuar'),
    false,
  );
  assert.equal(useConfirmationStore.getState().request.title, 'Sair');
  useConfirmationStore.getState().answer(true);
  assert.equal(await first, true);
});
test('two-step confirmations each require a separate answer', async () => {
  const first = useConfirmationStore
    .getState()
    .ask('Excluir', 'Continuar?', 'Continuar');
  useConfirmationStore.getState().answer(true);
  assert.equal(await first, true);
  const final = useConfirmationStore
    .getState()
    .ask('Confirmação final', 'Não pode ser desfeito', 'Excluir');
  assert.equal(
    useConfirmationStore.getState().request.title,
    'Confirmação final',
  );
  useConfirmationStore.getState().answer(false);
  assert.equal(await final, false);
});

const { previewCardSchedule } = load('utils/cardSchedule.ts');
test('credit card preview matches exact cent splits and future invoice dates', () => {
  const rows = previewCardSchedule('2026-10-10', 10, 15, 3, 100);
  assert.deepEqual(
    rows.map((r) => r.amount),
    [33.34, 33.33, 33.33],
  );
  assert.deepEqual(
    rows.map((r) => r.dueDate.slice(0, 10)),
    ['2026-11-15', '2026-12-15', '2027-01-15'],
  );
});
test('credit card preview handles leap years and equal or earlier due days', () => {
  const rows = previewCardSchedule('2028-01-31', 31, 5, 3, 0.05);
  assert.deepEqual(
    rows.map((r) => r.closingDate.slice(0, 10)),
    ['2028-02-29', '2028-03-31', '2028-04-30'],
  );
  assert.deepEqual(
    rows.map((r) => r.dueDate.slice(0, 10)),
    ['2028-03-05', '2028-04-05', '2028-05-05'],
  );
  assert.deepEqual(
    rows.map((r) => r.amount),
    [0.02, 0.02, 0.01],
  );
});
test('credit card preview preserves the total across all supported installment counts', () => {
  for (let count = 1; count <= 36; count++) {
    const rows = previewCardSchedule('2026-12-31', 31, 31, count, 999999999.99);
    assert.equal(
      rows.reduce((sum, r) => sum + Math.round(r.amount * 100), 0),
      99999999999,
    );
  }
  assert.deepEqual(previewCardSchedule('2026-10-01', 10, 15, 3, 0.02), []);
  assert.deepEqual(previewCardSchedule('bad', 10, 15, 1, 100), []);
});
