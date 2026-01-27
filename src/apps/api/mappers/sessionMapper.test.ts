import { describe, it, expect } from 'vitest';
import { SessionMapper } from './sessionMapper';
import { TimeSession, ActiveSession } from '../../../core/domains/session';

describe('SessionMapper', () => {
  const mockTimeSession: TimeSession = {
    id: '1',
    description: 'Test session',
    startTime: new Date(),
    endTime: new Date(),
    durationSeconds: 3600,
    mode: 'stopwatch',
    projectId: 'p1',
    userId: 'user-1',
  };

  const mockActiveSession: ActiveSession = {
    id: 'active-1',
    startTime: new Date(),
    mode: 'pomodoro',
    description: 'Working',
    targetSeconds: 1500,
    pomodoroPhase: 'work',
    pomodoroCycle: 1,
    projectId: 'p1',
    userId: 'user-1',
  };

  describe('toTimeSessionResponse', () => {
    it('should map a TimeSession domain to a response DTO', () => {
      const result = SessionMapper.toTimeSessionResponse(mockTimeSession);
      expect(result).toEqual(mockTimeSession);
    });
  });

  describe('toTimeSessionResponseList', () => {
    it('should map an array of TimeSessions', () => {
      const result = SessionMapper.toTimeSessionResponseList([mockTimeSession]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('toActiveSessionResponse', () => {
    it('should map an ActiveSession domain to a response DTO', () => {
      const result = SessionMapper.toActiveSessionResponse(mockActiveSession);
      expect(result).toEqual(mockActiveSession);
    });
  });
});
