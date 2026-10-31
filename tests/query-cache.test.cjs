const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'),
  path = require('node:path'),
  Module = require('node:module'),
  ts = require('typescript');
function harness(api = {}) {
  const modules = new Map();
  function load(relative) {
    const filename = path.resolve(__dirname, '../src', relative);
    if (modules.has(filename)) return modules.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    modules.set(filename, mod);
    mod.require = function (id) {
      if (id === './api') return { default: api };
      if (id.startsWith('.')) {
        const target = path.resolve(path.dirname(filename), id) + '.ts';
        if (fs.existsSync(target))
          return load(path.relative(path.resolve(__dirname, '../src'), target));
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
  return load;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
const { createQueryCache } = harness()('utils/queryCache.ts');
test('simultaneous and recently repeated screen reads share one HTTP request', async () => {
  const cache = createQueryCache();
  let calls = 0;
  const read = async () => {
    calls++;
    return ['account'];
  };
  await Promise.all(Array.from({ length: 20 }, () => cache.load('all', read)));
  await cache.load('all', read);
  assert.equal(calls, 1);
});
test('expiry, new filters, and manual refresh fetch fresh data', async () => {
  let time = 0,
    calls = 0;
  const cache = createQueryCache(100, () => time);
  const read = async () => ++calls;
  assert.equal(await cache.load('oct', read), 1);
  assert.equal(await cache.load('nov', read), 2);
  assert.equal(await cache.load('oct', read, true), 3);
  time = 101;
  assert.equal(await cache.load('oct', read), 4);
});
test('429 responses are not automatically retried or cached', async () => {
  const cache = createQueryCache();
  let calls = 0;
  const read = async () => {
    calls++;
    throw { response: { status: 429 } };
  };
  await assert.rejects(cache.load('all', read));
  assert.equal(calls, 1);
  await assert.rejects(cache.load('all', read));
  assert.equal(calls, 2);
});
test('invalidation prevents an earlier pending request from replacing the cache', async () => {
  const cache = createQueryCache();
  const old = deferred();
  const first = cache.load('all', () => old.promise);
  cache.clear();
  assert.equal(await cache.load('all', async () => 'new'), 'new');
  old.resolve('old');
  await first;
  assert.equal(await cache.load('all', async () => 'unexpected'), 'new');
});
test('financial writes invalidate both account balances and transaction lists', async () => {
  let gets = 0;
  const api = {
    get: async () => ({ data: [++gets] }),
    post: async () => ({ data: { id: 'new' } }),
    patch: async () => ({ data: { id: 'edited' } }),
    delete: async () => {},
  };
  const load = harness(api),
    { accountService } = load('services/accountService.ts'),
    { transactionService } = load('services/transactionService.ts');
  await accountService.getAll();
  await transactionService.getAll({ month: 10, year: 2026 });
  assert.equal(gets, 2);
  await transactionService.create({});
  await accountService.getAll();
  await transactionService.getAll({ month: 10, year: 2026 });
  assert.equal(gets, 4);
  await transactionService.update('new', {});
  await accountService.getAll();
  assert.equal(gets, 5);
  await transactionService.delete('new');
  await accountService.getAll();
  assert.equal(gets, 6);
});
test('logout discards cached and pending data from the previous session', async () => {
  const old = deferred();
  let calls = 0;
  const load = harness({
    get: () => {
      calls++;
      return calls === 1
        ? old.promise
        : Promise.resolve({ data: [{ id: 'new-user-account' }] });
    },
  });
  const { useAccountStore } = load('stores/accountStore.ts');
  const pending = useAccountStore.getState().fetch();
  await Promise.resolve();
  useAccountStore.getState().reset();
  old.resolve({ data: [{ id: 'old-user-account' }] });
  await pending;
  assert.deepEqual(useAccountStore.getState().accounts, []);
  await useAccountStore.getState().fetch();
  assert.equal(calls, 2);
  assert.equal(useAccountStore.getState().accounts[0].id, 'new-user-account');
});
test('older month responses cannot replace the latest filter results', async () => {
  const oct = deferred(),
    nov = deferred();
  const load = harness({
    get: (url) => (url.includes('month=10') ? oct.promise : nov.promise),
  });
  const { useTransactionStore } = load('stores/transactionStore.ts');
  const first = useTransactionStore.getState().fetch({ month: 10, year: 2026 });
  const second = useTransactionStore
    .getState()
    .fetch({ month: 11, year: 2026 });
  nov.resolve({ data: [{ id: 'nov' }] });
  await second;
  oct.resolve({ data: [{ id: 'oct' }] });
  await first;
  assert.equal(useTransactionStore.getState().transactions[0].id, 'nov');
});
test('429 has a clear Portuguese message distinct from a network error', () => {
  const { errorMessage } = harness()('utils/errorMessage.ts');
  assert.match(
    errorMessage(
      {
        response: {
          status: 429,
          data: { message: 'ThrottlerException: Too Many Requests' },
        },
      },
      'Erro',
    ),
    /Aguarde um minuto/,
  );
});

test('dashboard and form refocus share actual account and transaction service reads', async () => {
  const counts = { accounts: 0, transactions: 0 };
  const load = harness({
    get: async (url) => {
      if (url.startsWith('/accounts')) counts.accounts++;
      else counts.transactions++;
      return { data: [] };
    },
  });
  const { useAccountStore } = load('stores/accountStore.ts');
  const { useTransactionStore } = load('stores/transactionStore.ts');
  await Promise.all(
    Array.from({ length: 20 }, () =>
      Promise.all([
        useAccountStore.getState().fetch(),
        useTransactionStore.getState().fetch({ month: 10, year: 2026 }),
      ]),
    ),
  );
  await useAccountStore.getState().fetch();
  await useTransactionStore.getState().fetch({ month: 10, year: 2026 });
  assert.deepEqual(counts, { accounts: 1, transactions: 1 });
  await useAccountStore.getState().fetch(true);
  assert.equal(counts.accounts, 2);
});

test('transaction pages append progressively without losing the first page', async () => {
  const all = Array.from({ length: 40 }, (_, index) => ({
    id: String(index),
    title: 'Item ' + index,
  }));
  const load = harness({
    get: async (url) => {
      const params = new URL(url, 'http://localhost').searchParams;
      const skip = Number(params.get('skip') || 0),
        take = Number(params.get('take') || 30);
      return { data: all.slice(skip, skip + take) };
    },
  });
  const { useTransactionStore } = load('stores/transactionStore.ts');
  await useTransactionStore.getState().fetch({ month: 10, year: 2026 });
  assert.equal(useTransactionStore.getState().transactions.length, 30);
  assert.equal(useTransactionStore.getState().hasMore, true);
  await useTransactionStore.getState().loadMore();
  assert.equal(useTransactionStore.getState().transactions.length, 40);
  assert.equal(useTransactionStore.getState().hasMore, false);
  assert.equal(
    new Set(useTransactionStore.getState().transactions.map((row) => row.id))
      .size,
    40,
  );
});
test('changing filters discards a pending page from the previous history', async () => {
  const nextPage = deferred();
  const load = harness({
    get: async (url) => {
      const params = new URL(url, 'http://localhost').searchParams;
      if (params.get('month') === '11') return { data: [{ id: 'november' }] };
      if (params.get('skip') === '30') return nextPage.promise;
      return {
        data: Array.from({ length: 30 }, (_, index) => ({
          id: 'oct-' + index,
        })),
      };
    },
  });
  const { useTransactionStore } = load('stores/transactionStore.ts');
  useTransactionStore.getState().setFilters({ month: 10, year: 2026 });
  await useTransactionStore.getState().fetch();
  const loading = useTransactionStore.getState().loadMore();
  await Promise.resolve();
  await useTransactionStore.getState().fetch({ month: 11, year: 2026 });
  nextPage.resolve({ data: [{ id: 'stale' }] });
  await loading;
  assert.deepEqual(
    useTransactionStore.getState().transactions.map((row) => row.id),
    ['november'],
  );
  assert.equal(useTransactionStore.getState().isLoadingMore, false);
});
test('transaction requests preserve combined filters and special search characters', async () => {
  let requested;
  const load = harness({
    get: async (url) => {
      requested = new URL(url, 'http://localhost');
      return { data: [] };
    },
  });
  const { transactionService } = load('services/transactionService.ts');
  await transactionService.getAll({
    search: 'Pão & café',
    accountId: 'account',
    categoryId: 'food',
    type: 'EXPENSE',
    status: 'PLANNED',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    orderBy: 'amount',
    orderDir: 'asc',
    skip: 30,
    take: 30,
  });
  assert.equal(requested.searchParams.get('search'), 'Pão & café');
  assert.equal(requested.searchParams.get('accountId'), 'account');
  assert.equal(requested.searchParams.get('categoryId'), 'food');
  assert.equal(requested.searchParams.get('status'), 'PLANNED');
  assert.equal(requested.searchParams.get('orderDir'), 'asc');
  assert.equal(requested.searchParams.get('skip'), '30');
});
