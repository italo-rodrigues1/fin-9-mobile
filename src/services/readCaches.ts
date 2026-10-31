import { createQueryCache } from '../utils/queryCache';
import { Account, Category, Transaction } from '../types';
export const readCaches = {
  accounts: createQueryCache<Account[]>(),
  categories: createQueryCache<Category[]>(),
  transactions: createQueryCache<Transaction[]>(),
};
