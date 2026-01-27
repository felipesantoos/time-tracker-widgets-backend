import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { TokenService } from './TokenService';
import { ITokenRepository } from '../interfaces/secondary/ITokenRepository';
import { AccessToken } from '../domains/token';

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockTokenRepository: Mocked<ITokenRepository>;

  beforeEach(() => {
    mockTokenRepository = {
      create: vi.fn(),
      findManyByUserId: vi.fn(),
      findByIdAndUserId: vi.fn(),
      delete: vi.fn(),
      findByToken: vi.fn(),
      update: vi.fn(),
    } as any;

    tokenService = new TokenService(mockTokenRepository);
  });

  const mockToken: AccessToken = {
    id: 'token-1',
    token: 'some-random-token',
    userId: 'user-1',
    createdAt: new Date(),
  };

  describe('createToken', () => {
    it('should create a new token with a random string', async () => {
      mockTokenRepository.create.mockResolvedValue(mockToken);

      const result = await tokenService.createToken('user-1');

      expect(result).toEqual(mockToken);
      expect(mockTokenRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        token: expect.any(String),
      });
    });
  });

  describe('validateToken', () => {
    it('should return userId and update lastUsedAt if token is valid', async () => {
      mockTokenRepository.findByToken.mockResolvedValue(mockToken);
      mockTokenRepository.update.mockResolvedValue(mockToken);

      const result = await tokenService.validateToken('some-random-token');

      expect(result).toBe('user-1');
      expect(mockTokenRepository.update).toHaveBeenCalledWith('token-1', {
        lastUsedAt: expect.any(Date),
      });
    });

    it('should return null if token is invalid', async () => {
      mockTokenRepository.findByToken.mockResolvedValue(null);

      const result = await tokenService.validateToken('invalid-token');

      expect(result).toBeNull();
      expect(mockTokenRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteToken', () => {
    it('should delete token if found', async () => {
      mockTokenRepository.findByIdAndUserId.mockResolvedValue(mockToken);

      await tokenService.deleteToken('user-1', 'token-1');

      expect(mockTokenRepository.delete).toHaveBeenCalledWith('token-1');
    });

    it('should throw if token not found', async () => {
      mockTokenRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(tokenService.deleteToken('user-1', 'token-1'))
        .rejects.toThrow('Token not found');
    });
  });
});
