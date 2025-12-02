import { Router } from 'express';
import { castVote, getVotes } from '../controllers/vote.controller';

const router = Router();

router.post('/', castVote);
router.get('/retrospective/:retrospectiveId', getVotes);

export default router;
