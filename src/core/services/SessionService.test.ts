import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { SessionService } from './SessionService';
import { ISessionRepository } from '../interfaces/secondary/ISessionRepository';
import { IProjectRepository } from '../interfaces/secondary/IProjectRepository';
import { TimeSession, ActiveSession } from '../domains/session';

describe('SessionService', () => {
  let sessionService: SessionService;
  let mockSessionRepository: Mocked<ISessionRepository>;
  let mockProjectRepository: Mocked<IProjectRepository>;

  beforeEach(() => {
    mockSessionRepository = {
      findMany: vi.fn(),
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      upsertActive: vi.fn(),
      deleteActiveByUserId: vi.fn(),
      createTimeSessionAndDeleteActive: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByIdAndUserId: vi.fn(),
    } as any;

    mockProjectRepository = {
      findByIdAndUserId: vi.fn(),
    } as any;

    sessionService = new SessionService(mockSessionRepository, mockProjectRepository);
  });

  const mockTimeSession: TimeSession = {
    id: '1',
    startTime: new Date(),
    endTime: new Date(),
    durationSeconds: 3600,
    mode: 'stopwatch',
    userId: 'user-1',
  };

  const mockActiveSession: ActiveSession = {
    id: 'active-1',
    startTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
    mode: 'stopwatch',
    userId: 'user-1',
    pomodoroCycle: 0,
  };

  describe('listSessions', () => {
    it('should return paginated sessions', async () => {
      mockSessionRepository.findMany.mockResolvedValue([[mockTimeSession], 1]);

      const result = await sessionService.listSessions({
        userId: 'user-1',
        page: 1,
        limit: 10,
      });

      expect(result.sessions).toEqual([mockTimeSession]);
      expect(result.total).toBe(1);
      expect(mockSessionRepository.findMany).toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should create a session without project', async () => {
      mockSessionRepository.create.mockResolvedValue(mockTimeSession);

      const result = await sessionService.createSession(mockTimeSession);

      expect(result).toEqual(mockTimeSession);
    });

    it('should throw if project not found', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(sessionService.createSession({ ...mockTimeSession, projectId: 'invalid' }))
        .rejects.toThrow('Project not found');
    });
  });

  describe('finishActiveSession', () => {
    it('should finish an active session and return a time session', async () => {
      mockSessionRepository.findActiveByUserId.mockResolvedValue(mockActiveSession);
      mockSessionRepository.createTimeSessionAndDeleteActive.mockResolvedValue(mockTimeSession);

      const result = await sessionService.finishActiveSession('user-1');

      expect(result).toEqual(mockTimeSession);
      expect(mockSessionRepository.createTimeSessionAndDeleteActive).toHaveBeenCalled();
    });

    it('should throw if no active session found', async () => {
      mockSessionRepository.findActiveByUserId.mockResolvedValue(null);

      await expect(sessionService.finishActiveSession('user-1'))
        .rejects.toThrow('No active session found');
    });

    it('should throw if duration is invalid (0 or negative)', async () => {
      const activeWithFutureStart = { ...mockActiveSession, startTime: new Date(Date.now() + 10000) };
      mockSessionRepository.findActiveByUserId.mockResolvedValue(activeWithFutureStart);

      await expect(sessionService.finishActiveSession('user-1'))
        .rejects.toThrow('Invalid duration');
      expect(mockSessionRepository.deleteActiveByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should throw if duration is exactly zero', async () => {
      const now = new Date();
      vi.setSystemTime(now);
      const activeWithCurrentStart = { ...mockActiveSession, startTime: now };
      mockSessionRepository.findActiveByUserId.mockResolvedValue(activeWithCurrentStart);

      await expect(sessionService.finishActiveSession('user-1'))
        .rejects.toThrow('Invalid duration');
      
      vi.useRealTimers();
    });
  });

  describe('deleteSession', () => {
    it('should delete session if found', async () => {
      mockSessionRepository.findByIdAndUserId.mockResolvedValue(mockTimeSession);

      await sessionService.deleteSession('user-1', '1');

      expect(mockSessionRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw if session not found', async () => {
      mockSessionRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(sessionService.deleteSession('user-1', '1'))
        .rejects.toThrow('Session not found');
    });
  });
});
