import { Router } from 'express';
import {
  createTicket,
  updateTicket,
  deleteTicket,
  addComment,
  addReaction,
  createGroup,
  groupTickets,
} from '../controllers/ticket.controller';

const router = Router();

router.post('/', createTicket);
router.patch('/:id', updateTicket);
router.delete('/:id', deleteTicket);
router.post('/:id/comments', addComment);
router.post('/:id/reactions', addReaction);
router.post('/groups', createGroup);
router.post('/groups/assign', groupTickets);

export default router;
