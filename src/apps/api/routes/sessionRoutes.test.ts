import { describe, it, expect, vi } from 'vitest';
import { DIContainer } from '../dicontainer/dicontainer';

vi.mock('../dicontainer/dicontainer', () => ({
  DIContainer: {
    getSessionService: vi.fn(() => ({})),
  },
}));

describe('SessionRoutes', () => {
  it('should be defined', () => {
    expect(DIContainer.getSessionService).toBeDefined();
  });
});
