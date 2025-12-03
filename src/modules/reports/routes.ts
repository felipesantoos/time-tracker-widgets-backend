import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { authToken, AuthenticatedRequest } from '../../middleware/authToken';

const router = Router();

// GET /reports/summary - Resumo de tempo por período
router.get('/summary', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { from, to, groupBy = 'day' } = req.query;

    const fromDate = from ? new Date(from as string) : new Date();
    fromDate.setHours(0, 0, 0, 0);

    const toDate = to ? new Date(to as string) : new Date();
    toDate.setHours(23, 59, 59, 999);

    // Buscar todas as sessões no período
    const sessions = await prisma.timeSession.findMany({
      where: {
        userId,
        startTime: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Agregar por projeto
    const byProject: Record<string, {
      project: { id: string; name: string; color: string };
      totalSeconds: number;
      sessionCount: number;
    }> = {};

    for (const session of sessions) {
      const projectId = session.projectId;
      if (!byProject[projectId]) {
        byProject[projectId] = {
          project: session.project,
          totalSeconds: 0,
          sessionCount: 0,
        };
      }
      byProject[projectId].totalSeconds += session.durationSeconds;
      byProject[projectId].sessionCount += 1;
    }

    // Calcular total geral
    const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

    res.json({
      data: {
        period: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        totalSeconds,
        totalHours: totalSeconds / 3600,
        byProject: Object.values(byProject),
        sessionCount: sessions.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /reports/pomodoro - Contagem de pomodoros
router.get('/pomodoro', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { from, to } = req.query;

    const fromDate = from ? new Date(from as string) : new Date();
    fromDate.setHours(0, 0, 0, 0);

    const toDate = to ? new Date(to as string) : new Date();
    toDate.setHours(23, 59, 59, 999);

    // Buscar sessões pomodoro no período
    const pomodoroSessions = await prisma.timeSession.findMany({
      where: {
        userId,
        mode: 'pomodoro',
        startTime: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Agregar por projeto
    const byProject: Record<string, {
      project: { id: string; name: string; color: string };
      count: number;
    }> = {};

    for (const session of pomodoroSessions) {
      const projectId = session.projectId;
      if (!byProject[projectId]) {
        byProject[projectId] = {
          project: session.project,
          count: 0,
        };
      }
      byProject[projectId].count += 1;
    }

    res.json({
      data: {
        period: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        total: pomodoroSessions.length,
        byProject: Object.values(byProject),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

