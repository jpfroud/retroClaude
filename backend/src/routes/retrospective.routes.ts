import { Router } from 'express';
import {
  createRetrospective,
  getRetrospective,
  joinRetrospective,
  updatePhase,
  updateConfig,
  getRetrospectiveByInviteCode,
} from '../controllers/retrospective.controller';

const router = Router();

router.post('/', createRetrospective);
router.get('/:id', getRetrospective);
router.get('/invite/:inviteCode', getRetrospectiveByInviteCode);
router.post('/:id/join', joinRetrospective);
router.patch('/:id/phase', updatePhase);
router.patch('/:id/config', updateConfig);

export default router;
