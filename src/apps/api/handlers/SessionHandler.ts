import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authToken';
import { activeSessionEmitter } from '../../../core/events/activeSessionEmitter';
import { ISessionService } from '../../../core/interfaces/primary/ISessionService';

const createSessionSchema = z.object({
  projectId: z.string().min(1).optional().nullable(),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationSeconds: z.number().int().min(0),
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

export class SessionHandler {
  constructor(private readonly sessionService: ISessionService) {}

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, from, to, page = '1', limit = '50' } = req.query;
      const userId = req.userId!;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const { sessions, total } = await this.sessionService.listSessions({
        userId,
        projectId: projectId as string,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
        page: pageNum,
        limit: limitNum,
      });

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
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const body = createSessionSchema.parse(req.body);

      const session = await this.sessionService.createSession({
        userId,
        projectId: body.projectId,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        durationSeconds: body.durationSeconds,
        mode: body.mode,
      });

      res.status(201).json({ data: session });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: error.errors });
      if (error.message === "Project not found") return res.status(404).json({ error: 'Project not found' });
      next(error);
    }
  }

  async getActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const activeSession = await this.sessionService.getActiveSession(userId);
      if (!activeSession) return res.status(404).json({ error: 'No active session found' });
      res.json({ data: activeSession });
    } catch (error) {
      next(error);
    }
  }

  async upsertActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const body = activeSessionSchema.parse(req.body);

      const activeSession = await this.sessionService.upsertActiveSession(userId, {
        startTime: new Date(body.startTime),
        mode: body.mode,
        projectId: body.projectId,
        description: body.description,
        targetSeconds: body.targetSeconds,
        pomodoroPhase: body.pomodoroPhase,
        pomodoroCycle: body.pomodoroCycle ?? 0,
      });

      activeSessionEmitter.notifyActiveSessionChange(userId);
      res.json({ data: activeSession });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: error.errors });
      if (error.message === "Project not found") return res.status(404).json({ error: 'Project not found' });
      next(error);
    }
  }

  async finishActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await this.sessionService.finishActiveSession(userId);
      activeSessionEmitter.notifyActiveSessionChange(userId);
      res.json({ data: result });
    } catch (error: any) {
      if (error.message === "No active session found") return res.status(404).json({ error: 'No active session found' });
      if (error.message === "Invalid duration") return res.status(400).json({ error: 'Invalid duration' });
      next(error);
    }
  }

  async streamActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const sendEvent = (data: any) => {
        try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (err) {}
      };

      let cachedState: any = null;
      let lastQueryTime = 0;
      const QUERY_CACHE_MS = 100;

      const sendCurrentState = async (forceQuery = false) => {
        try {
          const now = Date.now();
          const shouldQuery = forceQuery || (now - lastQueryTime) > QUERY_CACHE_MS;
          let activeSession = cachedState?.activeSession;

          if (shouldQuery) {
            activeSession = await this.sessionService.getActiveSession(userId);
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
              project: (activeSession as any).project,
              elapsedSeconds,
            });
          } else {
            sendEvent({ active: false, elapsedSeconds: 0 });
          }
        } catch (err) {
          sendEvent({ active: false, error: 'Error fetching active session' });
        }
      };

      await sendCurrentState(true);

      const onChangeHandler = (changedUserId: string) => {
        if (changedUserId === userId) sendCurrentState(true);
      };
      activeSessionEmitter.on('activeSessionChange', onChangeHandler);

      let isClosed = false;
      const interval = setInterval(() => {
        if (isClosed) { clearInterval(interval); return; }
        if (cachedState?.activeSession) {
          const activeSession = cachedState.activeSession;
          const startTime = new Date(activeSession.startTime);
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
            project: (activeSession as any).project,
            elapsedSeconds,
          });
        }
      }, 1000);

      const cleanup = () => {
        isClosed = true;
        clearInterval(interval);
        activeSessionEmitter.removeListener('activeSessionChange', onChangeHandler);
        if (!res.headersSent) res.end();
      };

      req.on('close', cleanup);
      res.on('close', cleanup);
    } catch (error) {
      if (!res.headersSent) res.status(500).json({ error: 'Stream error' });
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const body = updateSessionSchema.parse(req.body);

      const updateData: any = { ...body };
      if (body.startTime) updateData.startTime = new Date(body.startTime);
      if (body.endTime) updateData.endTime = new Date(body.endTime);

      const session = await this.sessionService.updateSession(id, updateData);
      res.json({ data: session });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: error.errors });
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      await this.sessionService.deleteSession(userId, id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Session not found") return res.status(404).json({ error: 'Session not found' });
      next(error);
    }
  }
}
