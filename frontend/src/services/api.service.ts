import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const retroApi = {
  // Users
  createUser: (name: string, email?: string) =>
    api.post('/users', { name, email }),

  // Retrospectives
  createRetrospective: (data: any) =>
    api.post('/retrospectives', data),

  getRetrospective: (id: string) =>
    api.get(`/retrospectives/${id}`),

  getRetrospectiveByInviteCode: (inviteCode: string) =>
    api.get(`/retrospectives/invite/${inviteCode}`),

  joinRetrospective: (id: string, userId: string) =>
    api.post(`/retrospectives/${id}/join`, { userId }),

  updatePhase: (id: string, phase: string) =>
    api.patch(`/retrospectives/${id}/phase`, { phase }),

  updateConfig: (id: string, config: any) =>
    api.patch(`/retrospectives/${id}/config`, { config }),

  // Tickets
  createTicket: (data: any) =>
    api.post('/tickets', data),

  updateTicket: (id: string, updates: any) =>
    api.patch(`/tickets/${id}`, updates),

  deleteTicket: (id: string) =>
    api.delete(`/tickets/${id}`),

  addComment: (ticketId: string, authorId: string, content: string) =>
    api.post(`/tickets/${ticketId}/comments`, { authorId, content }),

  addReaction: (ticketId: string, emoji: string) =>
    api.post(`/tickets/${ticketId}/reactions`, { emoji }),

  createGroup: (retrospectiveId: string, title?: string) =>
    api.post('/tickets/groups', { retrospectiveId, title }),

  groupTickets: (ticketIds: string[], groupId: string) =>
    api.post('/tickets/groups/assign', { ticketIds, groupId }),

  // Votes
  castVote: (data: any) =>
    api.post('/votes', data),

  getVotes: (retrospectiveId: string) =>
    api.get(`/votes/retrospective/${retrospectiveId}`),

  // Actions
  createAction: (data: any) =>
    api.post('/actions', data),

  updateAction: (id: string, updates: any) =>
    api.patch(`/actions/${id}`, updates),

  getActions: (retrospectiveId: string) =>
    api.get(`/actions/retrospective/${retrospectiveId}`),

  createActionItem: (data: any) =>
    api.post('/actions/items', data),

  updateActionItem: (id: string, updates: any) =>
    api.patch(`/actions/items/${id}`, updates),
};
