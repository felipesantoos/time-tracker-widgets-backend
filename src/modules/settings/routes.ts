import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authToken, AuthenticatedRequest } from '../../middleware/authToken';

const router = Router();

const pomodoroSettingsSchema = z.object({
  workMinutes: z.number().int().positive().default(25),
  shortBreakMinutes: z.number().int().positive().default(5),
  longBreakMinutes: z.number().int().positive().default(15),
  longBreakInterval: z.number().int().positive().default(4),
  autoStartBreak: z.boolean().default(false),
});

// GET /settings/pomodoro - Buscar configurações
router.get('/pomodoro', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;

    let settings = await prisma.pomodoroSettings.findUnique({
      where: { userId },
    });

    // Se não existir, criar com defaults
    if (!settings) {
      settings = await prisma.pomodoroSettings.create({
        data: {
          userId,
          workMinutes: 25,
          shortBreakMinutes: 5,
          longBreakMinutes: 15,
          longBreakInterval: 4,
          autoStartBreak: false,
        },
      });
    }

    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
});

// PUT /settings/pomodoro - Salvar configurações
router.put('/pomodoro', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const body = pomodoroSettingsSchema.parse(req.body);

    const settings = await prisma.pomodoroSettings.upsert({
      where: { userId },
      update: body,
      create: {
        userId,
        ...body,
      },
    });

    res.json({ data: settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    next(error);
  }
});

export default router;

