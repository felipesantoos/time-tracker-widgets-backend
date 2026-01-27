import { IReportService } from "../interfaces/primary/IReportService";
import { ISessionRepository } from "../interfaces/secondary/ISessionRepository";

export class ReportService implements IReportService {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async getSummary(userId: string, from: Date, to: Date): Promise<any> {
    const sessions = await this.sessionRepository.findManyForReport({
      userId,
      fromDate: from,
      toDate: to,
    });

    const byProject: Record<string, any> = {};

    for (const session of sessions) {
      const projectId = session.projectId || "no-project";
      if (!byProject[projectId]) {
        byProject[projectId] = {
          project: (session as any).project || {
            id: "no-project",
            name: "No Project",
            color: "#999999",
          },
          totalSeconds: 0,
          sessionCount: 0,
        };
      }
      byProject[projectId].totalSeconds += session.durationSeconds;
      byProject[projectId].sessionCount += 1;
    }

    const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

    return {
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      totalSeconds,
      totalHours: totalSeconds / 3600,
      byProject: Object.values(byProject),
      sessionCount: sessions.length,
    };
  }

  async getPomodoroReport(userId: string, from: Date, to: Date): Promise<any> {
    const pomodoroSessions = await this.sessionRepository.findManyForReport({
      userId,
      fromDate: from,
      toDate: to,
      mode: "pomodoro",
    });

    const byProject: Record<string, any> = {};

    for (const session of pomodoroSessions) {
      const projectId = session.projectId || "no-project";
      if (!byProject[projectId]) {
        byProject[projectId] = {
          project: (session as any).project || {
            id: "no-project",
            name: "No Project",
            color: "#999999",
          },
          count: 0,
        };
      }
      byProject[projectId].count += 1;
    }

    return {
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      total: pomodoroSessions.length,
      byProject: Object.values(byProject),
    };
  }
}
