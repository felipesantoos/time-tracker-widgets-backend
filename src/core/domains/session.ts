export type SessionMode = 'stopwatch' | 'timer' | 'pomodoro';
export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export interface TimeSession {
  id: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  mode: SessionMode;
  projectId?: string | null;
  userId: string;
}

export interface ActiveSession {
  id: string;
  startTime: Date;
  mode: SessionMode;
  description?: string | null;
  targetSeconds?: number | null;
  pomodoroPhase?: string | null;
  pomodoroCycle: number;
  projectId?: string | null;
  userId: string;
}
