import { PomodoroSettings } from "../../domains/settings";

export interface ISettingsService {
  getPomodoroSettings(userId: string): Promise<PomodoroSettings>;
  updatePomodoroSettings(userId: string, settings: Partial<Omit<PomodoroSettings, "id" | "userId">>): Promise<PomodoroSettings>;
}
