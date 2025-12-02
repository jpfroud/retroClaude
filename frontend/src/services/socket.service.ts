import { io, Socket } from 'socket.io-client';
import { useRetroStore } from '../store/useRetroStore';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    const store = useRetroStore.getState();

    this.socket.on('connect', () => {
      console.log('Socket connected');
      store.setIsConnected(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      store.setIsConnected(false);
    });

    // Phase changes
    this.socket.on('phase_changed', (data: { phase: string }) => {
      store.updatePhase(data.phase);
    });

    // Participant ready status
    this.socket.on('participant_ready_status', (data: { userId: string; isReady: boolean }) => {
      store.updateParticipantReady(data.userId, data.isReady);
    });

    // Tickets
    this.socket.on('ticket_created', (ticket: any) => {
      store.addTicket(ticket);
    });

    this.socket.on('ticket_updated', (ticket: any) => {
      store.updateTicket(ticket);
    });

    this.socket.on('ticket_deleted', (data: { ticketId: string }) => {
      store.deleteTicket(data.ticketId);
    });

    this.socket.on('tickets_revealed', () => {
      const retro = store.retrospective;
      if (retro?.tickets) {
        retro.tickets.forEach((ticket: any) => {
          store.updateTicket({ ...ticket, isRevealed: true });
        });
      }
    });

    // Comments
    this.socket.on('comment_created', (comment: any) => {
      store.addComment(comment);
    });

    // Reactions
    this.socket.on('reaction_added', (reaction: any) => {
      store.addReaction(reaction);
    });

    // Groups
    this.socket.on('group_created', (group: any) => {
      store.addGroup(group);
    });

    this.socket.on('ticket_grouped', (group: any) => {
      store.updateGroup(group);
    });

    // Votes
    this.socket.on('vote_cast', (vote: any) => {
      store.addVote(vote);
    });

    // Actions
    this.socket.on('action_created', (action: any) => {
      store.addAction(action);
    });

    this.socket.on('action_updated', (action: any) => {
      store.updateAction(action);
    });

    // Timer
    this.socket.on('timer_started', (timer: any) => {
      store.updateTimer(timer);
    });

    this.socket.on('timer_stopped', () => {
      const retro = store.retrospective;
      if (retro?.timer) {
        store.updateTimer({ ...retro.timer, isRunning: false });
      }
    });

    this.socket.on('timer_updated', (timer: any) => {
      store.updateTimer(timer);
    });

    // Icebreaker
    this.socket.on('icebreaker_response', (response: any) => {
      store.addIcebreakerResponse(response);
    });

    // Welcome
    this.socket.on('welcome_vote', (vote: any) => {
      store.addWelcomeVote(vote);
    });

    // ROTI
    this.socket.on('roti_vote', (vote: any) => {
      store.addROTIVote(vote);
    });

    // Config
    this.socket.on('config_updated', (config: any) => {
      store.updateConfig(config);
    });
  }

  // Emit methods
  joinRetro(retroId: string, userId: string) {
    this.socket?.emit('join_retro', { retroId, userId });
  }

  leaveRetro(retroId: string, userId: string) {
    this.socket?.emit('leave_retro', { retroId, userId });
  }

  changePhase(retroId: string, phase: string) {
    this.socket?.emit('change_phase', { retroId, phase });
  }

  setParticipantReady(retroId: string, userId: string, isReady: boolean) {
    this.socket?.emit('participant_ready', { retroId, userId, isReady });
  }

  createTicket(retroId: string, ticketData: any) {
    this.socket?.emit('create_ticket', { retroId, ...ticketData });
  }

  updateTicket(retroId: string, ticketId: string, updates: any) {
    this.socket?.emit('update_ticket', { retroId, ticketId, updates });
  }

  deleteTicket(retroId: string, ticketId: string) {
    this.socket?.emit('delete_ticket', { retroId, ticketId });
  }

  revealTickets(retroId: string) {
    this.socket?.emit('reveal_tickets', { retroId });
  }

  createComment(retroId: string, ticketId: string, authorId: string, content: string) {
    this.socket?.emit('create_comment', { retroId, ticketId, authorId, content });
  }

  addReaction(retroId: string, ticketId: string, emoji: string) {
    this.socket?.emit('add_reaction', { retroId, ticketId, emoji });
  }

  createGroup(retroId: string, title?: string) {
    this.socket?.emit('create_group', { retroId, title });
  }

  groupTickets(retroId: string, ticketIds: string[], groupId: string) {
    this.socket?.emit('group_tickets', { retroId, ticketIds, groupId });
  }

  castVote(retroId: string, userId: string, ticketId?: string, groupId?: string) {
    this.socket?.emit('cast_vote', { retroId, userId, ticketId, groupId });
  }

  createAction(retroId: string, actionData: any) {
    this.socket?.emit('create_action', { retroId, ...actionData });
  }

  updateAction(retroId: string, actionId: string, updates: any) {
    this.socket?.emit('update_action', { retroId, actionId, updates });
  }

  startTimer(retroId: string, duration: number) {
    this.socket?.emit('start_timer', { retroId, duration });
  }

  stopTimer(retroId: string) {
    this.socket?.emit('stop_timer', { retroId });
  }

  submitIcebreaker(retroId: string, userId: string, response: string) {
    this.socket?.emit('submit_icebreaker', { retroId, userId, response });
  }

  submitWelcomeVote(retroId: string, userId: string, rating: number) {
    this.socket?.emit('submit_welcome_vote', { retroId, userId, rating });
  }

  submitROTIVote(retroId: string, userId: string, rating: number) {
    this.socket?.emit('submit_roti_vote', { retroId, userId, rating });
  }

  updateConfig(retroId: string, config: any) {
    this.socket?.emit('update_config', { retroId, config });
  }
}

export const socketService = new SocketService();
