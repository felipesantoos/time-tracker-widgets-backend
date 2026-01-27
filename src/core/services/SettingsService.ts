import { PomodoroSettings } from "../domains/settings";
import { ISettingsService } from "../interfaces/primary/ISettingsService";
import { ISettingsRepository } from "../interfaces/secondary/ISettingsRepository";

export class SettingsService implements ISettingsService {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async getPomodoroSettings(userId: string): Promise<PomodoroSettings> {
    let settings = await this.settingsRepository.findByUserId(userId);
    if (!settings) {
      settings = await this.settingsRepository.create({
        userId,
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
        autoStartBreak: false,
      });
    }
    return settings;
  }

  async updatePomodoroSettings(userId: string, settings: Partial<Omit<PomodoroSettings, "id" | "userId">>): Promise<PomodoroSettings> {
    return this.settingsRepository.upsert(userId, settings);
  }
}
