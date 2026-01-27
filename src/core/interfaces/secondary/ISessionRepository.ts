import { TimeSession, ActiveSession } from "../../domains/session";

export interface ISessionRepository {
  findMany(params: {
    userId: string;
    projectId?: string;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }): Promise<[TimeSession[], number]>;
  findByIdAndUserId(id: string, userId: string): Promise<TimeSession | null>;
  create(session: Omit<TimeSession, "id">): Promise<TimeSession>;
  update(id: string, session: Partial<Omit<TimeSession, "id" | "userId">>): Promise<TimeSession>;
  delete(id: string): Promise<void>;
  findActiveByUserId(userId: string): Promise<ActiveSession | null>;
  upsertActive(userId: string, session: Omit<ActiveSession, "id">): Promise<ActiveSession>;
  deleteActiveByUserId(userId: string): Promise<void>;
  createTimeSessionAndDeleteActive(session: Omit<TimeSession, "id">, userId: string): Promise<TimeSession>;
  findManyForReport(params: {
    userId: string;
    fromDate: Date;
    toDate: Date;
    mode?: "pomodoro";
  }): Promise<TimeSession[]>;
}
