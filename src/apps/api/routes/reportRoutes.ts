import { Router } from 'express';
import { authToken } from '../middleware/authToken';
import { ReportHandler } from '../handlers/ReportHandler';
import { DIContainer } from '../dicontainer/dicontainer';

const router = Router();
const service = DIContainer.getReportService();
const handler = new ReportHandler(service);

router.get('/summary', authToken, (req, res, next) => handler.summary(req as any, res, next));
router.get('/pomodoro', authToken, (req, res, next) => handler.pomodoro(req as any, res, next));

export default router;
