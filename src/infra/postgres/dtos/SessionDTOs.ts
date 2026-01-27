import { SessionMode } from "../../../core/domains/session";

export interface CreateSessionPostgresDTO {
  description?: string | null;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  mode: SessionMode;
  userId: string;
  projectId?: string | null;
}

export interface UpdateSessionPostgresDTO {
  description?: string | null;
  startTime?: Date;
  endTime?: Date;
  durationSeconds?: number;
  projectId?: string | null;
}

export interface UpsertActiveSessionPostgresDTO {
  startTime: Date;
  mode: SessionMode;
  userId: string;
  projectId?: string | null;
  description?: string | null;
  targetSeconds?: number | null;
  pomodoroPhase?: string | null;
  pomodoroCycle: number;
}
