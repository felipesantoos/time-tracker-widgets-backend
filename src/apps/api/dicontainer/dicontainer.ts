import { ProjectRepository } from "../../../infra/postgres/ProjectRepository";
import { SessionRepository } from "../../../infra/postgres/SessionRepository";
import { SettingsRepository } from "../../../infra/postgres/SettingsRepository";
import { TokenRepository } from "../../../infra/postgres/TokenRepository";
import { ProjectService } from "../../../core/services/ProjectService";
import { SessionService } from "../../../core/services/SessionService";
import { SettingsService } from "../../../core/services/SettingsService";
import { TokenService } from "../../../core/services/TokenService";
import { ReportService } from "../../../core/services/ReportService";
import { IProjectService } from "../../../core/interfaces/primary/IProjectService";
import { ISessionService } from "../../../core/interfaces/primary/ISessionService";
import { ISettingsService } from "../../../core/interfaces/primary/ISettingsService";
import { ITokenService } from "../../../core/interfaces/primary/ITokenService";
import { IReportService } from "../../../core/interfaces/primary/IReportService";

export class DIContainer {
  static getProjectService(): IProjectService {
    const repository = new ProjectRepository();
    return new ProjectService(repository);
  }

  static getSessionService(): ISessionService {
    const sessionRepository = new SessionRepository();
    const projectRepository = new ProjectRepository();
    return new SessionService(sessionRepository, projectRepository);
  }

  static getSettingsService(): ISettingsService {
    const repository = new SettingsRepository();
    return new SettingsService(repository);
  }

  static getTokenService(): ITokenService {
    const repository = new TokenRepository();
    return new TokenService(repository);
  }

  static getReportService(): IReportService {
    const repository = new SessionRepository();
    return new ReportService(repository);
  }
}
