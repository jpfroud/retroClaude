// Types partagés entre frontend et backend

export interface User {
  id: string;
  name: string;
  email?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Retrospective {
  id: string;
  title: string;
  description?: string;
  template: RetroTemplate;
  isAnonymous: boolean;
  inviteCode: string;
  qrCode?: string;
  currentPhase: RetroPhase;
  createdById: string;
  config: RetroConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type RetroTemplate = 'classic' | '4l' | 'start-stop-continue' | 'custom';

export type RetroPhase =
  | 'setup'
  | 'icebreaker'
  | 'welcome'
  | 'review-actions'
  | 'brainstorm'
  | 'group'
  | 'vote'
  | 'discuss'
  | 'review'
  | 'closing';

export interface RetroConfig {
  showAuthor?: boolean;
  colorMode?: 'by-person' | 'by-topic' | 'manual';
  revealImmediately?: boolean;
  facilitatorOnly?: boolean;
  icebreakerQuestion?: string;
  welcomeQuestion?: string;
  voteConfig?: VoteConfig;
  discussConfig?: DiscussConfig;
  sortMode?: 'by-author' | 'original' | 'random' | 'by-topic';
}

export interface VoteConfig {
  maxVotes: number;
  limitPerGroup?: boolean;
  mustUseAll?: boolean;
  voteOnGroups?: boolean; // true = voter sur les groupes, false = voter sur les tickets individuels
  showResults?: boolean;
}

export interface DiscussConfig {
  discussMode: 'all' | 'voted' | 'topN';
  topN?: number;
  anyoneCanPropose?: boolean;
}

export interface RetroParticipant {
  id: string;
  retrospectiveId: string;
  userId: string;
  role: 'facilitator' | 'participant';
  isReady: boolean;
  joinedAt: Date;
  user?: User;
}

export interface Column {
  id: string;
  retrospectiveId: string;
  title: string;
  color: string;
  position: number;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  retrospectiveId: string;
  columnId: string;
  authorId: string;
  content: string;
  color?: string;
  isRevealed: boolean;
  position: number;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  column?: Column;
  comments?: Comment[];
  reactions?: Reaction[];
  voteCount?: number;
}

export interface TicketGroup {
  id: string;
  retrospectiveId: string;
  title?: string;
  position: number;
  createdAt: Date;
  tickets?: Ticket[];
  voteCount?: number;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export interface Reaction {
  id: string;
  ticketId: string;
  emoji: string;
  count: number;
  createdAt: Date;
}

export interface Vote {
  id: string;
  retrospectiveId: string;
  userId: string;
  ticketId?: string;
  groupId?: string;
  createdAt: Date;
}

export interface Action {
  id: string;
  retrospectiveId: string;
  ticketId?: string;
  title: string;
  description?: string;
  assignedToId?: string;
  status: 'proposed' | 'approved' | 'rejected';
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: User;
}

export interface ActionItem {
  id: string;
  retrospectiveId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  isDone: boolean;
  fromRetroId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IcebreakerResponse {
  id: string;
  retrospectiveId: string;
  userId: string;
  response: string;
  createdAt: Date;
  user?: User;
}

export interface WelcomeVote {
  id: string;
  retrospectiveId: string;
  userId: string;
  rating: number;
  createdAt: Date;
  user?: User;
}

export interface ROTIVote {
  id: string;
  retrospectiveId: string;
  userId: string;
  rating: number;
  createdAt: Date;
  user?: User;
}

export interface Timer {
  id: string;
  retrospectiveId: string;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  startedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Templates prédéfinis
export interface RetroTemplateDefinition {
  id: RetroTemplate;
  name: string;
  description: string;
  columns: {
    title: string;
    color: string;
  }[];
}

export const RETRO_TEMPLATES: RetroTemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Ce qui s\'est bien passé / Ce qui s\'est moins bien passé',
    columns: [
      { title: 'Ce qui s\'est bien passé 😊', color: '#10b981' },
      { title: 'Ce qui s\'est moins bien passé 😟', color: '#ef4444' },
      { title: 'Idées d\'amélioration 💡', color: '#3b82f6' },
    ],
  },
  {
    id: '4l',
    name: '4L',
    description: 'Learned, Liked, Lacked, Longed for',
    columns: [
      { title: 'Learned (Appris) 📚', color: '#8b5cf6' },
      { title: 'Liked (Aimé) ❤️', color: '#ec4899' },
      { title: 'Lacked (Manqué) 🔍', color: '#f59e0b' },
      { title: 'Longed for (Désiré) 🌟', color: '#06b6d4' },
    ],
  },
  {
    id: 'start-stop-continue',
    name: 'Start, Stop, Continue',
    description: 'Actions à commencer, arrêter et continuer',
    columns: [
      { title: 'Start (Commencer) 🚀', color: '#10b981' },
      { title: 'Stop (Arrêter) 🛑', color: '#ef4444' },
      { title: 'Continue (Continuer) ➡️', color: '#3b82f6' },
    ],
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    description: 'Créez vos propres colonnes',
    columns: [],
  },
];

// Events WebSocket
export enum SocketEvent {
  // Connection
  JOIN_RETRO = 'join_retro',
  LEAVE_RETRO = 'leave_retro',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',

  // Phase
  PHASE_CHANGED = 'phase_changed',
  CHANGE_PHASE = 'change_phase',

  // Participants
  PARTICIPANT_READY = 'participant_ready',
  PARTICIPANT_READY_STATUS = 'participant_ready_status',

  // Tickets
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_DELETED = 'ticket_deleted',
  TICKETS_REVEALED = 'tickets_revealed',
  CREATE_TICKET = 'create_ticket',
  UPDATE_TICKET = 'update_ticket',
  DELETE_TICKET = 'delete_ticket',
  REVEAL_TICKETS = 'reveal_tickets',

  // Comments
  COMMENT_CREATED = 'comment_created',
  CREATE_COMMENT = 'create_comment',

  // Reactions
  REACTION_ADDED = 'reaction_added',
  ADD_REACTION = 'add_reaction',

  // Groups
  GROUP_CREATED = 'group_created',
  TICKET_GROUPED = 'ticket_grouped',
  CREATE_GROUP = 'create_group',
  GROUP_TICKETS = 'group_tickets',

  // Votes
  VOTE_CAST = 'vote_cast',
  CAST_VOTE = 'cast_vote',
  VOTES_REVEALED = 'votes_revealed',

  // Actions
  ACTION_CREATED = 'action_created',
  ACTION_UPDATED = 'action_updated',
  CREATE_ACTION = 'create_action',
  UPDATE_ACTION = 'update_action',

  // Timer
  TIMER_STARTED = 'timer_started',
  TIMER_STOPPED = 'timer_stopped',
  TIMER_UPDATED = 'timer_updated',
  START_TIMER = 'start_timer',
  STOP_TIMER = 'stop_timer',

  // Icebreaker
  ICEBREAKER_RESPONSE = 'icebreaker_response',
  SUBMIT_ICEBREAKER = 'submit_icebreaker',

  // Welcome
  WELCOME_VOTE = 'welcome_vote',
  SUBMIT_WELCOME_VOTE = 'submit_welcome_vote',

  // ROTI
  ROTI_VOTE = 'roti_vote',
  SUBMIT_ROTI_VOTE = 'submit_roti_vote',

  // Config
  CONFIG_UPDATED = 'config_updated',
  UPDATE_CONFIG = 'update_config',
}
