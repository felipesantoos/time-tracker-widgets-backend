export interface UpdatePomodoroSettingsRequest {
  workMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  longBreakInterval?: number;
  autoStartBreak?: boolean;
}
