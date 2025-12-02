import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email?: string;
  color: string;
}

interface Retrospective {
  id: string;
  title: string;
  description?: string;
  template: string;
  isAnonymous: boolean;
  inviteCode: string;
  qrCode?: string;
  currentPhase: string;
  config: any;
  columns?: any[];
  participants?: any[];
  tickets?: any[];
  ticketGroups?: any[];
  votes?: any[];
  actions?: any[];
  actionItems?: any[];
  icebreakers?: any[];
  welcomeVotes?: any[];
  rotiVotes?: any[];
  timer?: any;
}

interface RetroStore {
  currentUser: User | null;
  retrospective: Retrospective | null;
  isConnected: boolean;
  setCurrentUser: (user: User) => void;
  setRetrospective: (retro: Retrospective) => void;
  setIsConnected: (connected: boolean) => void;
  updatePhase: (phase: string) => void;
  addTicket: (ticket: any) => void;
  updateTicket: (ticket: any) => void;
  deleteTicket: (ticketId: string) => void;
  addComment: (comment: any) => void;
  addReaction: (reaction: any) => void;
  addGroup: (group: any) => void;
  updateGroup: (group: any) => void;
  addVote: (vote: any) => void;
  addAction: (action: any) => void;
  updateAction: (action: any) => void;
  updateConfig: (config: any) => void;
  updateTimer: (timer: any) => void;
  addIcebreakerResponse: (response: any) => void;
  addWelcomeVote: (vote: any) => void;
  addROTIVote: (vote: any) => void;
  updateParticipantReady: (userId: string, isReady: boolean) => void;
  reset: () => void;
}

export const useRetroStore = create<RetroStore>((set) => ({
  currentUser: null,
  retrospective: null,
  isConnected: false,

  setCurrentUser: (user) => set({ currentUser: user }),

  setRetrospective: (retro) => set({ retrospective: retro }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  updatePhase: (phase) =>
    set((state) => ({
      retrospective: state.retrospective
        ? { ...state.retrospective, currentPhase: phase }
        : null,
    })),

  addTicket: (ticket) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          tickets: [...(state.retrospective.tickets || []), ticket],
        },
      };
    }),

  updateTicket: (updatedTicket) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          tickets: state.retrospective.tickets?.map((t) =>
            t.id === updatedTicket.id ? updatedTicket : t
          ),
        },
      };
    }),

  deleteTicket: (ticketId) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          tickets: state.retrospective.tickets?.filter((t) => t.id !== ticketId),
        },
      };
    }),

  addComment: (comment) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          tickets: state.retrospective.tickets?.map((t) =>
            t.id === comment.ticketId
              ? { ...t, comments: [...(t.comments || []), comment] }
              : t
          ),
        },
      };
    }),

  addReaction: (reaction) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          tickets: state.retrospective.tickets?.map((t) => {
            if (t.id === reaction.ticketId) {
              const existingReactionIndex = t.reactions?.findIndex(
                (r: any) => r.emoji === reaction.emoji
              );
              if (existingReactionIndex >= 0) {
                const newReactions = [...(t.reactions || [])];
                newReactions[existingReactionIndex] = reaction;
                return { ...t, reactions: newReactions };
              } else {
                return { ...t, reactions: [...(t.reactions || []), reaction] };
              }
            }
            return t;
          }),
        },
      };
    }),

  addGroup: (group) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          ticketGroups: [...(state.retrospective.ticketGroups || []), group],
        },
      };
    }),

  updateGroup: (updatedGroup) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          ticketGroups: state.retrospective.ticketGroups?.map((g) =>
            g.id === updatedGroup.id ? updatedGroup : g
          ),
        },
      };
    }),

  addVote: (vote) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          votes: [...(state.retrospective.votes || []), vote],
        },
      };
    }),

  addAction: (action) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          actions: [...(state.retrospective.actions || []), action],
        },
      };
    }),

  updateAction: (updatedAction) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          actions: state.retrospective.actions?.map((a) =>
            a.id === updatedAction.id ? updatedAction : a
          ),
        },
      };
    }),

  updateConfig: (config) =>
    set((state) => ({
      retrospective: state.retrospective
        ? { ...state.retrospective, config }
        : null,
    })),

  updateTimer: (timer) =>
    set((state) => ({
      retrospective: state.retrospective
        ? { ...state.retrospective, timer }
        : null,
    })),

  addIcebreakerResponse: (response) =>
    set((state) => {
      if (!state.retrospective) return state;
      const existingIndex = state.retrospective.icebreakers?.findIndex(
        (r: any) => r.userId === response.userId
      );
      if (existingIndex >= 0) {
        const newIcebreakers = [...(state.retrospective.icebreakers || [])];
        newIcebreakers[existingIndex] = response;
        return {
          retrospective: {
            ...state.retrospective,
            icebreakers: newIcebreakers,
          },
        };
      }
      return {
        retrospective: {
          ...state.retrospective,
          icebreakers: [...(state.retrospective.icebreakers || []), response],
        },
      };
    }),

  addWelcomeVote: (vote) =>
    set((state) => {
      if (!state.retrospective) return state;
      const existingIndex = state.retrospective.welcomeVotes?.findIndex(
        (v: any) => v.userId === vote.userId
      );
      if (existingIndex >= 0) {
        const newVotes = [...(state.retrospective.welcomeVotes || [])];
        newVotes[existingIndex] = vote;
        return {
          retrospective: {
            ...state.retrospective,
            welcomeVotes: newVotes,
          },
        };
      }
      return {
        retrospective: {
          ...state.retrospective,
          welcomeVotes: [...(state.retrospective.welcomeVotes || []), vote],
        },
      };
    }),

  addROTIVote: (vote) =>
    set((state) => {
      if (!state.retrospective) return state;
      const existingIndex = state.retrospective.rotiVotes?.findIndex(
        (v: any) => v.userId === vote.userId
      );
      if (existingIndex >= 0) {
        const newVotes = [...(state.retrospective.rotiVotes || [])];
        newVotes[existingIndex] = vote;
        return {
          retrospective: {
            ...state.retrospective,
            rotiVotes: newVotes,
          },
        };
      }
      return {
        retrospective: {
          ...state.retrospective,
          rotiVotes: [...(state.retrospective.rotiVotes || []), vote],
        },
      };
    }),

  updateParticipantReady: (userId, isReady) =>
    set((state) => {
      if (!state.retrospective) return state;
      return {
        retrospective: {
          ...state.retrospective,
          participants: state.retrospective.participants?.map((p) =>
            p.userId === userId ? { ...p, isReady } : p
          ),
        },
      };
    }),

  reset: () =>
    set({
      currentUser: null,
      retrospective: null,
      isConnected: false,
    }),
}));
