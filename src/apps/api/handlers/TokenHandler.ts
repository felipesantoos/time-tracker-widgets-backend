import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authToken';
import { ITokenService } from '../../../core/interfaces/primary/ITokenService';

export class TokenHandler {
  constructor(private readonly tokenService: ITokenService) {}

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const accessToken = await this.tokenService.createToken(userId);

      res.status(201).json({
        data: {
          id: accessToken.id,
          token: accessToken.token,
          createdAt: accessToken.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const tokens = await this.tokenService.listTokens(userId);
      res.json({ data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      try {
        await this.tokenService.deleteToken(userId, id);
        res.status(204).send();
      } catch (error: any) {
        if (error.message === "Token not found") {
          return res.status(404).json({ error: 'Token not found' });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
