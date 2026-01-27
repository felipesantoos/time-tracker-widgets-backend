export interface CreateSettingsPostgresDTO {
  userId: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
}

export interface UpdateSettingsPostgresDTO {
  workMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  longBreakInterval?: number;
  autoStartBreak?: boolean;
}
