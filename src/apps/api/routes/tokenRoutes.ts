import { Router } from 'express';
import { authToken } from '../middleware/authToken';
import { TokenHandler } from '../handlers/TokenHandler';
import { DIContainer } from '../dicontainer/dicontainer';

const router = Router();
const service = DIContainer.getTokenService();
const handler = new TokenHandler(service);

router.post('/', authToken, (req, res, next) => handler.create(req as any, res, next));
router.get('/', authToken, (req, res, next) => handler.list(req as any, res, next));
router.delete('/:id', authToken, (req, res, next) => handler.delete(req as any, res, next));

export default router;
