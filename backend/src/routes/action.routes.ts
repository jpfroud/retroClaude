import { Router } from 'express';
import {
  createAction,
  updateAction,
  getActions,
  createActionItem,
  updateActionItem,
} from '../controllers/action.controller';

const router = Router();

router.post('/', createAction);
router.patch('/:id', updateAction);
router.get('/retrospective/:retrospectiveId', getActions);
router.post('/items', createActionItem);
router.patch('/items/:id', updateActionItem);

export default router;
