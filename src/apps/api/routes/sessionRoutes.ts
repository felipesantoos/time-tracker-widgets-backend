import { Router } from 'express';
import { authToken } from '../middleware/authToken';
import { SessionHandler } from '../handlers/SessionHandler';
import { DIContainer } from '../dicontainer/dicontainer';

const router = Router();
const service = DIContainer.getSessionService();
const handler = new SessionHandler(service);

router.get('/', authToken, (req, res, next) => handler.list(req as any, res, next));
router.post('/', authToken, (req, res, next) => handler.create(req as any, res, next));
router.get('/active', authToken, (req, res, next) => handler.getActive(req as any, res, next));
router.post('/active', authToken, (req, res, next) => handler.upsertActive(req as any, res, next));
router.delete('/active', authToken, (req, res, next) => handler.finishActive(req as any, res, next));
router.get('/active/stream', authToken, (req, res, next) => handler.streamActive(req as any, res, next));
router.patch('/:id', authToken, (req, res, next) => handler.update(req as any, res, next));
router.delete('/:id', authToken, (req, res, next) => handler.delete(req as any, res, next));

export default router;
