import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authToken';
import { ISettingsService } from '../../../core/interfaces/primary/ISettingsService';

const pomodoroSettingsSchema = z.object({
  workMinutes: z.number().int().positive().default(25),
  shortBreakMinutes: z.number().int().positive().default(5),
  longBreakMinutes: z.number().int().positive().default(15),
  longBreakInterval: z.number().int().positive().default(4),
  autoStartBreak: z.boolean().default(false),
});

export class SettingsHandler {
  constructor(private readonly settingsService: ISettingsService) {}

  async getPomodoro(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const settings = await this.settingsService.getPomodoroSettings(userId);
      res.json({ data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updatePomodoro(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const body = pomodoroSettingsSchema.parse(req.body);
      const settings = await this.settingsService.updatePomodoroSettings(userId, body);
      res.json({ data: settings });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: error.errors });
      next(error);
    }
  }
}
