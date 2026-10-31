import api from './api';
import {
  Goal,
  GoalContribution,
  GoalDetail,
  GoalOverview,
  SaveGoal,
  SaveGoalContribution,
} from '../types';
export const goalService = {
  overview: async (): Promise<GoalOverview> => (await api.get('/goals')).data,
  detail: async (id: string, skip = 0): Promise<GoalDetail> =>
    (await api.get('/goals/' + id, { params: { skip, take: 30 } })).data,
  save: async (
    payload: SaveGoal,
    id?: string,
  ): Promise<Pick<Goal, 'id' | 'name' | 'targetAmount' | 'deadline'>> =>
    (id
      ? await api.patch('/goals/' + id, payload)
      : await api.post('/goals', payload)
    ).data,
  remove: async (id: string) => {
    await api.delete('/goals/' + id);
  },
  contribution: async (goalId: string, id: string): Promise<GoalContribution> =>
    (await api.get('/goals/' + goalId + '/contributions/' + id)).data,
  saveContribution: async (
    goalId: string,
    payload: SaveGoalContribution,
    id?: string,
  ): Promise<GoalContribution> =>
    (id
      ? await api.patch('/goals/' + goalId + '/contributions/' + id, payload)
      : await api.post('/goals/' + goalId + '/contributions', payload)
    ).data,
  removeContribution: async (goalId: string, id: string) => {
    await api.delete('/goals/' + goalId + '/contributions/' + id);
  },
};
