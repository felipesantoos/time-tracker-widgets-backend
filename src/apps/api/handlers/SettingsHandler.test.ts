import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { Response, NextFunction } from 'express';
import { SettingsHandler } from './SettingsHandler';
import { ISettingsService } from '../../../core/interfaces/primary/ISettingsService';
import { AuthenticatedRequest } from '../middleware/authToken';

describe('SettingsHandler', () => {
  let handler: SettingsHandler;
  let mockSettingsService: Mocked<ISettingsService>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockSettingsService = {
      getPomodoroSettings: vi.fn(),
      updatePomodoroSettings: vi.fn(),
    } as any;

    handler = new SettingsHandler(mockSettingsService);
    
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  const mockReq = (body = {}, userId = 'user-1') => ({
    body,
    userId,
  } as unknown as AuthenticatedRequest);

  describe('getPomodoro', () => {
    it('should return settings', async () => {
      const settings = { workMinutes: 25 };
      mockSettingsService.getPomodoroSettings.mockResolvedValue(settings as any);

      await handler.getPomodoro(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: settings });
    });
  });

  describe('updatePomodoro', () => {
    it('should update settings with valid data', async () => {
      const body = { workMinutes: 30, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakInterval: 4, autoStartBreak: true };
      mockSettingsService.updatePomodoroSettings.mockResolvedValue(body as any);

      await handler.updatePomodoro(mockReq(body), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: body });
    });

    it('should return 400 for invalid data', async () => {
      await handler.updatePomodoro(mockReq({ workMinutes: -5 }), mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
