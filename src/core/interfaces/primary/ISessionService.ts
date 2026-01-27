import { TimeSession, ActiveSession } from "../../domains/session";

export interface ISessionService {
  listSessions(params: {
    userId: string;
    projectId?: string;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
  }): Promise<{ sessions: TimeSession[]; total: number }>;
  createSession(session: Omit<TimeSession, "id">): Promise<TimeSession>;
  getActiveSession(userId: string): Promise<ActiveSession | null>;
  upsertActiveSession(userId: string, session: Omit<ActiveSession, "id" | "userId">): Promise<ActiveSession>;
  finishActiveSession(userId: string): Promise<TimeSession>;
  updateSession(id: string, session: Partial<Omit<TimeSession, "id" | "userId">>): Promise<TimeSession>;
  deleteSession(userId: string, id: string): Promise<void>;
}
