import { SessionMode, PomodoroPhase } from "../../../../core/domains/session";

export interface CreateTimeSessionRequest {
  description?: string;
  startTime: string; // ISO string from API
  endTime: string;   // ISO string from API
  durationSeconds: number;
  mode: SessionMode;
  projectId?: string;
}

export interface StartSessionRequest {
  mode: SessionMode;
  description?: string;
  projectId?: string;
  targetSeconds?: number;
  pomodoroPhase?: PomodoroPhase;
}
