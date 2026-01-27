import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authToken';
import { ITokenService } from '../../../core/interfaces/primary/ITokenService';

export class TokenHandler {
  constructor(private readonly tokenService: ITokenService) {}

  /**
   * @openapi
   * /api/tokens:
   *   post:
   *     tags:
   *       - Tokens
   *     summary: Create a new access token
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       201:
   *         description: Token created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Token'
   */
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

  /**
   * @openapi
   * /api/tokens:
   *   get:
   *     tags:
   *       - Tokens
   *     summary: List all access tokens for the user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of tokens
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Token'
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const tokens = await this.tokenService.listTokens(userId);
      res.json({ data: tokens });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @openapi
   * /api/tokens/{id}:
   *   delete:
   *     tags:
   *       - Tokens
   *     summary: Delete an access token
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Token deleted
   *       404:
   *         description: Token not found
   */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         token:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
