import { Router } from 'express';
import projectsRoutes from './projectRoutes';
import sessionsRoutes from './sessionRoutes';
import reportsRoutes from './reportRoutes';
import settingsRoutes from './settingsRoutes';
import tokensRoutes from './tokenRoutes';

const router = Router();

router.use('/projects', projectsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/tokens', tokensRoutes);

export default router;
