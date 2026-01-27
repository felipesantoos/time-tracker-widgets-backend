import { TimeSession, ActiveSession } from "../../../core/domains/session";
import { TimeSessionResponse, ActiveSessionResponse } from "../dtos/response/session";

export class SessionMapper {
  static toTimeSessionResponse(domain: TimeSession): TimeSessionResponse {
    return {
      id: domain.id,
      description: domain.description,
      startTime: domain.startTime,
      endTime: domain.endTime,
      durationSeconds: domain.durationSeconds,
      mode: domain.mode,
      projectId: domain.projectId,
      userId: domain.userId,
    };
  }

  static toTimeSessionResponseList(domains: TimeSession[]): TimeSessionResponse[] {
    return domains.map((domain) => this.toTimeSessionResponse(domain));
  }

  static toActiveSessionResponse(domain: ActiveSession): ActiveSessionResponse {
    return {
      id: domain.id,
      startTime: domain.startTime,
      mode: domain.mode,
      description: domain.description,
      targetSeconds: domain.targetSeconds,
      pomodoroPhase: domain.pomodoroPhase,
      pomodoroCycle: domain.pomodoroCycle,
      projectId: domain.projectId,
      userId: domain.userId,
    };
  }
}
