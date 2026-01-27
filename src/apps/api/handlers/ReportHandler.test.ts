import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { Response, NextFunction } from 'express';
import { ReportHandler } from './ReportHandler';
import { IReportService } from '../../../core/interfaces/primary/IReportService';
import { AuthenticatedRequest } from '../middleware/authToken';

describe('ReportHandler', () => {
  let handler: ReportHandler;
  let mockReportService: Mocked<IReportService>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReportService = {
      getSummary: vi.fn(),
      getPomodoroReport: vi.fn(),
    } as any;

    handler = new ReportHandler(mockReportService);
    
    mockRes = {
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  const mockReq = (query = {}, userId = 'user-1') => ({
    query,
    userId,
  } as unknown as AuthenticatedRequest);

  describe('summary', () => {
    it('should return summary for date range', async () => {
      const summaryData = { totalSeconds: 3600 };
      mockReportService.getSummary.mockResolvedValue(summaryData);

      await handler.summary(mockReq({ from: '2024-01-01', to: '2024-01-02' }), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: summaryData });
      expect(mockReportService.getSummary).toHaveBeenCalledWith(
        'user-1',
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  describe('pomodoro', () => {
    it('should return pomodoro report', async () => {
      const reportData = { total: 5 };
      mockReportService.getPomodoroReport.mockResolvedValue(reportData);

      await handler.pomodoro(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: reportData });
    });
  });
});
