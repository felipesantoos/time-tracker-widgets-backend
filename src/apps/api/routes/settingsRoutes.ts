import { Router } from 'express';
import { authToken } from '../middleware/authToken';
import { SettingsHandler } from '../handlers/SettingsHandler';
import { DIContainer } from '../dicontainer/dicontainer';

const router = Router();
const service = DIContainer.getSettingsService();
const handler = new SettingsHandler(service);

router.get('/pomodoro', authToken, (req, res, next) => handler.getPomodoro(req as any, res, next));
router.put('/pomodoro', authToken, (req, res, next) => handler.updatePomodoro(req as any, res, next));

export default router;
