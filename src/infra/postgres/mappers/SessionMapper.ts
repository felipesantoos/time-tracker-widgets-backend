import { TimeSession, ActiveSession, SessionMode } from "../../../core/domains/session";
import { CreateSessionPostgresDTO, UpdateSessionPostgresDTO, UpsertActiveSessionPostgresDTO } from "../dtos/SessionDTOs";

export class SessionMapper {
  static toTimeSessionDomain(prismaSession: any): TimeSession {
    return {
      id: prismaSession.id,
      description: prismaSession.description,
      startTime: prismaSession.startTime,
      endTime: prismaSession.endTime,
      durationSeconds: prismaSession.durationSeconds,
      mode: prismaSession.mode as SessionMode,
      projectId: prismaSession.projectId,
      userId: prismaSession.userId,
    };
  }

  static toTimeSessionDomainList(prismaSessions: any[]): TimeSession[] {
    return prismaSessions.map((s) => this.toTimeSessionDomain(s));
  }

  static toActiveSessionDomain(prismaActive: any): ActiveSession {
    return {
      id: prismaActive.id,
      startTime: prismaActive.startTime,
      mode: prismaActive.mode as SessionMode,
      description: prismaActive.description,
      targetSeconds: prismaActive.targetSeconds,
      pomodoroPhase: prismaActive.pomodoroPhase,
      pomodoroCycle: prismaActive.pomodoroCycle,
      projectId: prismaActive.projectId,
      userId: prismaActive.userId,
    };
  }

  static toCreateDTO(session: Omit<TimeSession, "id">): CreateSessionPostgresDTO {
    return {
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      durationSeconds: session.durationSeconds,
      mode: session.mode as any,
      userId: session.userId,
      projectId: session.projectId,
    };
  }

  static toUpdateDTO(session: Partial<Omit<TimeSession, "id" | "userId">>): UpdateSessionPostgresDTO {
    return {
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      durationSeconds: session.durationSeconds,
      projectId: session.projectId,
    };
  }

  static toUpsertActiveDTO(session: Omit<ActiveSession, "id">): UpsertActiveSessionPostgresDTO {
    return {
      startTime: session.startTime,
      mode: session.mode as any,
      userId: session.userId,
      projectId: session.projectId,
      description: session.description,
      targetSeconds: session.targetSeconds,
      pomodoroPhase: session.pomodoroPhase,
      pomodoroCycle: session.pomodoroCycle,
    };
  }
}
