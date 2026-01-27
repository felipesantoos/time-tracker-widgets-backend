import { PomodoroSettings } from "../../../core/domains/settings";
import { CreateSettingsPostgresDTO, UpdateSettingsPostgresDTO } from "../dtos/SettingsDTOs";

export class SettingsMapper {
  static toDomain(prismaSettings: any): PomodoroSettings {
    return {
      id: prismaSettings.id,
      workMinutes: prismaSettings.workMinutes,
      shortBreakMinutes: prismaSettings.shortBreakMinutes,
      longBreakMinutes: prismaSettings.longBreakMinutes,
      longBreakInterval: prismaSettings.longBreakInterval,
      autoStartBreak: prismaSettings.autoStartBreak,
      userId: prismaSettings.userId,
    };
  }

  static toCreateDTO(settings: Omit<PomodoroSettings, "id">): CreateSettingsPostgresDTO {
    return {
      userId: settings.userId,
      workMinutes: settings.workMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      autoStartBreak: settings.autoStartBreak,
    };
  }

  static toUpdateDTO(settings: Partial<Omit<PomodoroSettings, "id" | "userId">>): UpdateSettingsPostgresDTO {
    return {
      workMinutes: settings.workMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      autoStartBreak: settings.autoStartBreak,
    };
  }
}
