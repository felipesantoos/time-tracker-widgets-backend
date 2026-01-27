import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { Response, NextFunction } from 'express';
import { TokenHandler } from './TokenHandler';
import { ITokenService } from '../../../core/interfaces/primary/ITokenService';
import { AuthenticatedRequest } from '../middleware/authToken';

describe('TokenHandler', () => {
  let handler: TokenHandler;
  let mockTokenService: Mocked<ITokenService>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockTokenService = {
      createToken: vi.fn(),
      listTokens: vi.fn(),
      deleteToken: vi.fn(),
    } as any;

    handler = new TokenHandler(mockTokenService);
    
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  const mockReq = (params = {}, userId = 'user-1') => ({
    params,
    userId,
  } as unknown as AuthenticatedRequest);

  describe('create', () => {
    it('should create token and return 201', async () => {
      const token = { id: '1', token: 'abc', createdAt: new Date() };
      mockTokenService.createToken.mockResolvedValue(token as any);

      await handler.create(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          id: token.id,
          token: token.token,
          createdAt: token.createdAt,
        }
      });
    });
  });

  describe('list', () => {
    it('should return token list', async () => {
      mockTokenService.listTokens.mockResolvedValue([]);

      await handler.list(mockReq(), mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  describe('delete', () => {
    it('should return 204 on success', async () => {
      mockTokenService.deleteToken.mockResolvedValue();

      await handler.delete(mockReq({ id: '1' }), mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if token not found', async () => {
      mockTokenService.deleteToken.mockRejectedValue(new Error('Token not found'));

      await handler.delete(mockReq({ id: '1' }), mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
