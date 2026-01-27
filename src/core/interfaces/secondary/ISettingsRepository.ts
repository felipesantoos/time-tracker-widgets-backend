import { PomodoroSettings } from "../../domains/settings";

export interface ISettingsRepository {
  findByUserId(userId: string): Promise<PomodoroSettings | null>;
  create(settings: Omit<PomodoroSettings, "id">): Promise<PomodoroSettings>;
  upsert(userId: string, settings: Partial<Omit<PomodoroSettings, "id" | "userId">>): Promise<PomodoroSettings>;
}
