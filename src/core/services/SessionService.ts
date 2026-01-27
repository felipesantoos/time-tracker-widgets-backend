import { TimeSession, ActiveSession, SessionMode } from "../domains/session";
import { ISessionService } from "../interfaces/primary/ISessionService";
import { ISessionRepository } from "../interfaces/secondary/ISessionRepository";
import { IProjectRepository } from "../interfaces/secondary/IProjectRepository";

export class SessionService implements ISessionService {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  async listSessions(params: {
    userId: string;
    projectId?: string;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
  }): Promise<{ sessions: TimeSession[]; total: number }> {
    const skip = (params.page - 1) * params.limit;
    const [sessions, total] = await this.sessionRepository.findMany({
      ...params,
      skip,
      take: params.limit,
    });
    return { sessions, total };
  }

  async createSession(session: Omit<TimeSession, "id">): Promise<TimeSession> {
    if (session.projectId) {
      const project = await this.projectRepository.findByIdAndUserId(session.projectId, session.userId);
      if (!project) {
        throw new Error("Project not found");
      }
    }
    return this.sessionRepository.create(session);
  }

  async getActiveSession(userId: string): Promise<ActiveSession | null> {
    return this.sessionRepository.findActiveByUserId(userId);
  }

  async upsertActiveSession(userId: string, session: Omit<ActiveSession, "id" | "userId">): Promise<ActiveSession> {
    if (session.projectId) {
      const project = await this.projectRepository.findByIdAndUserId(session.projectId, userId);
      if (!project) {
        throw new Error("Project not found");
      }
    }
    return this.sessionRepository.upsertActive(userId, { ...session, userId });
  }

  async finishActiveSession(userId: string): Promise<TimeSession> {
    const activeSession = await this.sessionRepository.findActiveByUserId(userId);
    if (!activeSession) {
      throw new Error("No active session found");
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000);

    if (duration <= 0) {
      await this.sessionRepository.deleteActiveByUserId(userId);
      throw new Error("Invalid duration");
    }

    const sessionData: Omit<TimeSession, "id"> = {
      userId,
      startTime: activeSession.startTime,
      endTime,
      durationSeconds: duration,
      mode: activeSession.mode,
      projectId: activeSession.projectId,
      description: activeSession.description,
    };

    return this.sessionRepository.createTimeSessionAndDeleteActive(sessionData, userId);
  }

  async updateSession(id: string, session: Partial<Omit<TimeSession, "id" | "userId">>): Promise<TimeSession> {
    // Note: In a real scenario, we might need userId here to verify ownership
    // For now, we follow the interface signature
    return this.sessionRepository.update(id, session);
  }

  async deleteSession(userId: string, id: string): Promise<void> {
    const existing = await this.sessionRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new Error("Session not found");
    }
    await this.sessionRepository.delete(id);
  }
}
