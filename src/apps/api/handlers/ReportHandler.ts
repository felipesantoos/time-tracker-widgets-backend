import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authToken';
import { IReportService } from '../../../core/interfaces/primary/IReportService';

export class ReportHandler {
  constructor(private readonly reportService: IReportService) {}

  /**
   * @openapi
   * /api/reports/summary:
   *   get:
   *     tags:
   *       - Reports
   *     summary: Get a summary report of sessions
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: from
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: to
   *         schema:
   *           type: string
   *           format: date-time
   *     responses:
   *       200:
   *         description: Report summary
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   */
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

  /**
   * @openapi
   * /api/reports/pomodoro:
   *   get:
   *     tags:
   *       - Reports
   *     summary: Get a pomodoro-specific report
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: from
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: to
   *         schema:
   *           type: string
   *           format: date-time
   *     responses:
   *       200:
   *         description: Pomodoro report
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   */
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
