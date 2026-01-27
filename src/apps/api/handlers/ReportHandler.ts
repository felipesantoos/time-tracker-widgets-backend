import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authToken';
import { IReportService } from '../../../core/interfaces/primary/IReportService';

export class ReportHandler {
  constructor(private readonly reportService: IReportService) {}

  async summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { from, to } = req.query;

      const fromDate = from ? new Date(from as string) : new Date();
      fromDate.setHours(0, 0, 0, 0);

      const toDate = to ? new Date(to as string) : new Date();
      toDate.setHours(23, 59, 59, 999);

      const summary = await this.reportService.getSummary(userId, fromDate, toDate);

      res.json({ data: summary });
    } catch (error) {
      next(error);
    }
  }

  async pomodoro(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { from, to } = req.query;

      const fromDate = from ? new Date(from as string) : new Date();
      fromDate.setHours(0, 0, 0, 0);

      const toDate = to ? new Date(to as string) : new Date();
      toDate.setHours(23, 59, 59, 999);

      const report = await this.reportService.getPomodoroReport(userId, fromDate, toDate);

      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  }
}
