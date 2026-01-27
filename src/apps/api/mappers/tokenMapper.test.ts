import { describe, it, expect } from 'vitest';
import { TokenMapper } from './tokenMapper';
import { AccessToken } from '../../../core/domains/token';

describe('TokenMapper', () => {
  const mockToken: AccessToken = {
    id: 't1',
    token: 'secret-token',
    userId: 'user-1',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    revokedAt: null,
  };

  describe('toResponse', () => {
    it('should map AccessToken domain to a response DTO', () => {
      const result = TokenMapper.toResponse(mockToken);
      expect(result).toEqual({
        id: mockToken.id,
        token: mockToken.token,
        userId: mockToken.userId,
        createdAt: mockToken.createdAt,
        lastUsedAt: mockToken.lastUsedAt,
        revokedAt: mockToken.revokedAt,
      });
    });
  });
});
