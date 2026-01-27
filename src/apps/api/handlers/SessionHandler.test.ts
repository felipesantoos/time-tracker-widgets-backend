import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { Response, NextFunction } from 'express';
import { SessionHandler } from './SessionHandler';
import { ISessionService } from '../../../core/interfaces/primary/ISessionService';
import { AuthenticatedRequest } from '../middleware/authToken';

describe('SessionHandler', () => {
  let handler: SessionHandler;
  let mockSessionService: Mocked<ISessionService>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockSessionService = {
      listSessions: vi.fn(),
      createSession: vi.fn(),
      getActiveSession: vi.fn(),
      upsertActiveSession: vi.fn(),
      finishActiveSession: vi.fn(),
      updateSession: vi.fn(),
      deleteSession: vi.fn(),
    } as any;

    handler = new SessionHandler(mockSessionService);
    
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn(),
    };
    mockNext = vi.fn();
  });

  const mockReq = (body = {}, query = {}, params = {}, userId = 'user-1') => ({
    body,
    query,
    params,
    userId,
    on: vi.fn(),
  } as unknown as AuthenticatedRequest);

  describe('list', () => {
    it('should return paginated sessions', async () => {
      mockSessionService.listSessions.mockResolvedValue({ sessions: [], total: 0 });

      await handler.list(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
    });
  });

  describe('create', () => {
    it('should create session with valid data', async () => {
      const body = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 100,
        mode: 'stopwatch'
      };
      mockSessionService.createSession.mockResolvedValue({ id: '1', ...body, userId: 'user-1' } as any);

      await handler.create(mockReq(body), mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 for invalid zod data', async () => {
      await handler.create(mockReq({ mode: 'invalid' }), mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('finishActive', () => {
    it('should finish session and return 200', async () => {
      mockSessionService.finishActiveSession.mockResolvedValue({ id: '1' } as any);

      await handler.finishActive(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: { id: '1' } });
    });

    it('should return 404 if no active session', async () => {
      mockSessionService.finishActiveSession.mockRejectedValue(new Error('No active session found'));

      await handler.finishActive(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
