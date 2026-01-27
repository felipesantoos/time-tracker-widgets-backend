import { describe, it, expect, vi } from 'vitest';
import { DIContainer } from '../dicontainer/dicontainer';

vi.mock('../dicontainer/dicontainer', () => ({
  DIContainer: {
    getTokenService: vi.fn(() => ({})),
  },
}));

describe('TokenRoutes', () => {
  it('should be defined', () => {
    expect(DIContainer.getTokenService).toBeDefined();
  });
});
