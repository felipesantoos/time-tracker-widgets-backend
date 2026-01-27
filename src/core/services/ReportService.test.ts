import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { ReportService } from './ReportService';
import { ISessionRepository } from '../interfaces/secondary/ISessionRepository';

describe('ReportService', () => {
  let reportService: ReportService;
  let mockSessionRepository: Mocked<ISessionRepository>;

  beforeEach(() => {
    mockSessionRepository = {
      findManyForReport: vi.fn(),
    } as any;

    reportService = new ReportService(mockSessionRepository);
  });

  const from = new Date('2024-01-01T00:00:00Z');
  const to = new Date('2024-01-31T23:59:59Z');

  const mockSessions = [
    {
      id: '1',
      durationSeconds: 3600,
      projectId: 'p1',
      project: { id: 'p1', name: 'Project 1', color: '#ff0000' },
    },
    {
      id: '2',
      durationSeconds: 1800,
      projectId: 'p1',
      project: { id: 'p1', name: 'Project 1', color: '#ff0000' },
    },
    {
      id: '3',
      durationSeconds: 1200,
      projectId: null,
    },
  ];

  describe('getSummary', () => {
    it('should aggregate sessions by project and calculate totals', async () => {
      mockSessionRepository.findManyForReport.mockResolvedValue(mockSessions as any);

      const result = await reportService.getSummary('user-1', from, to);

      expect(result.totalSeconds).toBe(6600);
      expect(result.totalHours).toBe(6600 / 3600);
      expect(result.sessionCount).toBe(3);
      expect(result.byProject).toHaveLength(2); // Project 1 and No Project

      const project1 = result.byProject.find((p: any) => p.project.id === 'p1');
      expect(project1.totalSeconds).toBe(5400);
      expect(project1.sessionCount).toBe(2);

      const noProject = result.byProject.find((p: any) => p.project.id === 'no-project');
      expect(noProject.totalSeconds).toBe(1200);
      expect(noProject.sessionCount).toBe(1);
    });

    it('should return empty summary if no sessions found', async () => {
      mockSessionRepository.findManyForReport.mockResolvedValue([]);

      const result = await reportService.getSummary('user-1', from, to);

      expect(result.totalSeconds).toBe(0);
      expect(result.byProject).toHaveLength(0);
      expect(result.sessionCount).toBe(0);
    });
  });

  describe('getPomodoroReport', () => {
    it('should count pomodoro sessions by project', async () => {
      mockSessionRepository.findManyForReport.mockResolvedValue([mockSessions[0], mockSessions[2]] as any);

      const result = await reportService.getPomodoroReport('user-1', from, to);

      expect(result.total).toBe(2);
      expect(result.byProject).toHaveLength(2);
      expect(mockSessionRepository.findManyForReport).toHaveBeenCalledWith(expect.objectContaining({
        mode: 'pomodoro',
      }));
    });
  });
});
