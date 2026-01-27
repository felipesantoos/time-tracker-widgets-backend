import { PomodoroSettings } from "../../../core/domains/settings";
import { PomodoroSettingsResponse } from "../dtos/response/settings";

export class SettingsMapper {
  static toResponse(domain: PomodoroSettings): PomodoroSettingsResponse {
    return {
      id: domain.id,
      workMinutes: domain.workMinutes,
      shortBreakMinutes: domain.shortBreakMinutes,
      longBreakMinutes: domain.longBreakMinutes,
      longBreakInterval: domain.longBreakInterval,
      autoStartBreak: domain.autoStartBreak,
      userId: domain.userId,
    };
  }
}
