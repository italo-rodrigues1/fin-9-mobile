import api from './api';
import { invalidateFinance } from './planningService';
import {
  CreditCard,
  CardDetail,
  CardInvoiceDetail,
  CardPurchase,
  SaveCreditCard,
  SaveCardPurchase,
} from '../types';
export const cardService = {
  list: async (): Promise<CreditCard[]> => (await api.get('/cards')).data,
  detail: async (id: string): Promise<CardDetail> =>
    (await api.get('/cards/' + id)).data,
  save: async (
    data: SaveCreditCard,
    id?: string,
  ): Promise<Pick<CreditCard, 'id'>> =>
    (id
      ? await api.patch('/cards/' + id, data)
      : await api.post('/cards', data)
    ).data,
  purchase: async (cardId: string, id: string): Promise<CardPurchase> =>
    (await api.get('/cards/' + cardId + '/purchases/' + id)).data,
  savePurchase: async (
    cardId: string,
    data: SaveCardPurchase,
    id?: string,
  ): Promise<Pick<CardPurchase, 'id'>> =>
    (id
      ? await api.patch('/cards/' + cardId + '/purchases/' + id, data)
      : await api.post('/cards/' + cardId + '/purchases', data)
    ).data,
  removePurchase: async (cardId: string, id: string) => {
    await api.delete('/cards/' + cardId + '/purchases/' + id);
  },
  invoice: async (
    cardId: string,
    id: string,
    skip = 0,
  ): Promise<CardInvoiceDetail> =>
    (
      await api.get('/cards/' + cardId + '/invoices/' + id, {
        params: { skip, take: 30 },
      })
    ).data,
  pay: async (
    cardId: string,
    id: string,
    data: { accountId: string; date: string; requestId: string },
  ) => {
    await api.post('/cards/' + cardId + '/invoices/' + id + '/payments', data);
    invalidateFinance();
  },
  reverse: async (cardId: string, invoiceId: string, id: string) => {
    await api.delete(
      '/cards/' + cardId + '/invoices/' + invoiceId + '/payments/' + id,
    );
    invalidateFinance();
  },
};
