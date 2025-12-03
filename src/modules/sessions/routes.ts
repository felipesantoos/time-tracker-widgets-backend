import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authToken, AuthenticatedRequest } from '../../middleware/authToken';

const router = Router();

const createSessionSchema = z.object({
  projectId: z.string().min(1).optional().nullable(), // Opcional - pode ser null
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationSeconds: z.number().int().positive(),
  mode: z.enum(['stopwatch', 'timer', 'pomodoro']),
});

const updateSessionSchema = z.object({
  description: z.string().optional(),
  projectId: z.string().min(1).optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

// GET /sessions - Listar sessões com filtros
router.get('/', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { projectId, from, to, page = '1', limit = '50' } = req.query;
    const userId = req.userId!;

    const where: any = {
      userId,
    };

    if (projectId) {
      where.projectId = projectId as string;
    }

    if (from || to) {
      where.startTime = {};
      if (from) {
        where.startTime.gte = new Date(from as string);
      }
      if (to) {
        where.startTime.lte = new Date(to as string);
      }
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      prisma.timeSession.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.timeSession.count({ where }),
    ]);

    res.json({
      data: sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /sessions - Criar sessão
router.post('/', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const body = createSessionSchema.parse(req.body);

    // Verificar se o projeto pertence ao usuário (apenas se projectId foi fornecido)
    if (body.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: body.projectId,
          userId,
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
    }

    const sessionData: {
      description?: string;
      startTime: Date;
      endTime: Date;
      durationSeconds: number;
      mode: 'stopwatch' | 'timer' | 'pomodoro';
      userId: string;
      projectId?: string | null;
    } = {
      description: body.description,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      durationSeconds: body.durationSeconds,
      mode: body.mode,
      userId,
    };

    // Incluir projectId apenas se fornecido, senão será null
    if (body.projectId) {
      sessionData.projectId = body.projectId;
    } else {
      sessionData.projectId = null;
    }

    const session = await prisma.timeSession.create({
      data: sessionData as any,
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

    res.status(201).json({ data: session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    next(error);
  }
});

// PATCH /sessions/:id - Atualizar sessão
router.patch('/:id', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const body = updateSessionSchema.parse(req.body);

    // Verificar se a sessão pertence ao usuário
    const existingSession = await prisma.timeSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Se projectId foi fornecido, verificar se pertence ao usuário
    if (body.projectId !== undefined) {
      if (body.projectId) {
        const project = await prisma.project.findFirst({
          where: {
            id: body.projectId,
            userId,
          },
        });

        if (!project) {
          return res.status(404).json({ error: 'Projeto não encontrado' });
        }
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    
    if (body.projectId !== undefined) {
      updateData.projectId = body.projectId || null;
    }

    // Se startTime ou endTime foram fornecidos, recalcular durationSeconds
    let newStartTime = existingSession.startTime;
    let newEndTime = existingSession.endTime;
    
    if (body.startTime) {
      newStartTime = new Date(body.startTime);
      if (isNaN(newStartTime.getTime())) {
        return res.status(400).json({ error: 'Data de início inválida' });
      }
      updateData.startTime = newStartTime;
    }
    
    if (body.endTime) {
      newEndTime = new Date(body.endTime);
      if (isNaN(newEndTime.getTime())) {
        return res.status(400).json({ error: 'Data de término inválida' });
      }
      updateData.endTime = newEndTime;
    }

    // Recalcular durationSeconds se startTime ou endTime mudaram
    if (body.startTime || body.endTime) {
      updateData.durationSeconds = Math.floor((newEndTime.getTime() - newStartTime.getTime()) / 1000);
      
      if (updateData.durationSeconds <= 0) {
        return res.status(400).json({ error: 'A data de término deve ser posterior à data de início' });
      }
    }

    const session = await prisma.timeSession.update({
      where: { id },
      data: updateData,
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

    res.json({ data: session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    next(error);
  }
});

// DELETE /sessions/:id - Deletar sessão
router.delete('/:id', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const session = await prisma.timeSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    await prisma.timeSession.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

