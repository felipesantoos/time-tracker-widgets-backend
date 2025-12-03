import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authToken, AuthenticatedRequest } from '../../middleware/authToken';
import { activeSessionEmitter } from './activeSessionEmitter';

const router = Router();

const createSessionSchema = z.object({
  projectId: z.string().min(1).optional().nullable(), // Opcional - pode ser null
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationSeconds: z.number().int().min(0), // Permite zero (tempos iguais)
  mode: z.enum(['stopwatch', 'timer', 'pomodoro']),
});

const updateSessionSchema = z.object({
  description: z.string().optional(),
  projectId: z.string().min(1).optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

const activeSessionSchema = z.object({
  startTime: z.string().datetime(),
  mode: z.enum(['stopwatch', 'timer', 'pomodoro']),
  projectId: z.string().min(1).optional().nullable(),
  description: z.string().optional(),
  targetSeconds: z.number().int().min(0).optional().nullable(),
  pomodoroPhase: z.enum(['work', 'shortBreak', 'longBreak']).optional().nullable(),
  pomodoroCycle: z.number().int().min(0).optional(),
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

    console.log('Listando sessões com filtros:', { userId, where, page: pageNum, limit: limitNum });

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
          endTime: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.timeSession.count({ where }),
    ]);

    console.log(`Encontradas ${sessions.length} sessões de ${total} total para usuário ${userId}`);

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

// GET /sessions/active - Buscar sessão ativa do usuário
router.get('/active', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;

    const activeSession = await prisma.activeSession.findUnique({
      where: { userId },
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

    if (!activeSession) {
      return res.status(404).json({ error: 'Nenhuma sessão ativa encontrada' });
    }

    res.json({ data: activeSession });
  } catch (error) {
    next(error);
  }
});

// POST /sessions/active - Criar ou atualizar sessão ativa
router.post('/active', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const body = activeSessionSchema.parse(req.body);

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

    const activeSessionData: {
      startTime: Date;
      mode: 'stopwatch' | 'timer' | 'pomodoro';
      userId: string;
      projectId?: string | null;
      description?: string;
      targetSeconds?: number | null;
      pomodoroPhase?: string | null;
      pomodoroCycle: number;
    } = {
      startTime: new Date(body.startTime),
      mode: body.mode,
      userId,
      pomodoroCycle: body.pomodoroCycle ?? 0,
    };

    if (body.description !== undefined) {
      // Se description for string vazia, definir como undefined para remover
      activeSessionData.description = body.description && body.description.trim() 
        ? body.description.trim() 
        : undefined;
    }

    if (body.projectId !== undefined) {
      activeSessionData.projectId = body.projectId || null;
    } else {
      activeSessionData.projectId = null;
    }

    if (body.targetSeconds !== undefined) {
      activeSessionData.targetSeconds = body.targetSeconds;
    }

    if (body.pomodoroPhase !== undefined) {
      activeSessionData.pomodoroPhase = body.pomodoroPhase;
    }

    // Usar upsert para criar ou atualizar
    const activeSession = await prisma.activeSession.upsert({
      where: { userId },
      update: activeSessionData,
      create: activeSessionData,
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

    // Notificar mudança para os clientes SSE
    activeSessionEmitter.notifyActiveSessionChange(userId);

    res.json({ data: activeSession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    next(error);
  }
});

// DELETE /sessions/active - Finalizar sessão ativa (cria TimeSession e remove ActiveSession)
router.delete('/active', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;

    const activeSession = await prisma.activeSession.findUnique({
      where: { userId },
    });

    if (!activeSession) {
      return res.status(404).json({ error: 'Nenhuma sessão ativa encontrada' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000);

    if (duration <= 0) {
      // Se a duração for inválida, apenas remover a sessão ativa
      await prisma.activeSession.delete({
        where: { userId },
      });
      return res.status(400).json({ error: 'Duração inválida' });
    }

    // Preparar dados da TimeSession
    const sessionData: {
      description?: string;
      startTime: Date;
      endTime: Date;
      durationSeconds: number;
      mode: 'stopwatch' | 'timer' | 'pomodoro';
      userId: string;
      projectId?: string | null;
    } = {
      startTime: activeSession.startTime,
      endTime,
      durationSeconds: duration,
      mode: activeSession.mode,
      userId,
      projectId: activeSession.projectId || null,
    };

    // Incluir description apenas se não for null/undefined/vazio
    if (activeSession.description && activeSession.description.trim()) {
      sessionData.description = activeSession.description.trim();
    }

    // Usar transação para garantir atomicidade: criar TimeSession e deletar ActiveSession
    const result = await prisma.$transaction(async (tx) => {
      // Criar TimeSession primeiro
      console.log('Criando TimeSession com dados:', {
        userId,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        durationSeconds: sessionData.durationSeconds,
        mode: sessionData.mode,
        projectId: sessionData.projectId,
        description: sessionData.description,
      });

      const timeSession = await tx.timeSession.create({
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

      console.log('TimeSession criada com sucesso:', timeSession.id);

      // Remover sessão ativa apenas se a criação foi bem-sucedida
      await tx.activeSession.delete({
        where: { userId },
      });

      console.log('ActiveSession removida com sucesso');

      return timeSession;
    });

    // Notificar mudança para os clientes SSE
    activeSessionEmitter.notifyActiveSessionChange(userId);

    console.log('Transação concluída, retornando TimeSession:', result.id);
    res.json({ data: result });
  } catch (error) {
    console.error('Erro ao finalizar sessão ativa:', error);
    next(error);
  }
});

// GET /sessions/active/stream - SSE stream para sessão ativa
router.get('/active/stream', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;

    // Configurar headers SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Desabilitar buffering do nginx

    // Função para enviar evento SSE
    const sendEvent = (data: any) => {
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        // Cliente desconectado, ignorar erro
      }
    };

    // Cache do estado atual para evitar queries desnecessárias
    let cachedState: any = null;
    let lastQueryTime = 0;
    const QUERY_CACHE_MS = 100; // Cache queries por 100ms

    // Função para buscar e enviar estado atual
    const sendCurrentState = async (forceQuery = false) => {
      try {
        const now = Date.now();
        const shouldQuery = forceQuery || (now - lastQueryTime) > QUERY_CACHE_MS;

        let activeSession = cachedState?.activeSession;

        if (shouldQuery) {
          activeSession = await prisma.activeSession.findUnique({
            where: { userId },
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
          cachedState = { activeSession };
          lastQueryTime = now;
        }

        if (activeSession) {
          const currentTime = new Date();
          const elapsedSeconds = Math.floor((currentTime.getTime() - activeSession.startTime.getTime()) / 1000);

          sendEvent({
            active: true,
            id: activeSession.id,
            startTime: activeSession.startTime.toISOString(),
            mode: activeSession.mode,
            projectId: activeSession.projectId,
            description: activeSession.description,
            targetSeconds: activeSession.targetSeconds,
            pomodoroPhase: activeSession.pomodoroPhase,
            pomodoroCycle: activeSession.pomodoroCycle,
            project: activeSession.project,
            elapsedSeconds,
          });
        } else {
          sendEvent({
            active: false,
            elapsedSeconds: 0,
          });
        }
      } catch (err) {
        console.error('Erro ao buscar sessão ativa no SSE:', err);
        sendEvent({
          active: false,
          error: 'Erro ao buscar sessão ativa',
        });
      }
    };

    // Enviar estado inicial
    await sendCurrentState(true);

    // Listener para mudanças na sessão ativa (event-driven)
    const onChangeHandler = (changedUserId: string) => {
      if (changedUserId === userId) {
        sendCurrentState(true);
      }
    };
    activeSessionEmitter.on('activeSessionChange', onChangeHandler);

    // Enviar atualizações de tempo a cada segundo (sem query no banco)
    let isClosed = false;
    const interval = setInterval(() => {
      if (isClosed) {
        clearInterval(interval);
        return;
      }

      // Apenas atualizar elapsedSeconds sem fazer query no banco
      if (cachedState?.activeSession) {
        const activeSession = cachedState.activeSession;
        const startTime = activeSession.startTime instanceof Date 
          ? activeSession.startTime 
          : new Date(activeSession.startTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

        sendEvent({
          active: true,
          id: activeSession.id,
          startTime: startTime.toISOString(),
          mode: activeSession.mode,
          projectId: activeSession.projectId,
          description: activeSession.description,
          targetSeconds: activeSession.targetSeconds,
          pomodoroPhase: activeSession.pomodoroPhase,
          pomodoroCycle: activeSession.pomodoroCycle,
          project: activeSession.project,
          elapsedSeconds,
        });
      }
    }, 1000);

    // Limpar ao desconectar
    const cleanup = () => {
      isClosed = true;
      clearInterval(interval);
      activeSessionEmitter.removeListener('activeSessionChange', onChangeHandler);
      if (!res.headersSent) {
        res.end();
      }
    };

    req.on('close', cleanup);
    res.on('close', cleanup);
  } catch (error) {
    console.error('Erro no SSE stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro no stream' });
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
      
      if (updateData.durationSeconds < 0) {
        return res.status(400).json({ error: 'A data de término deve ser posterior ou igual à data de início' });
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

