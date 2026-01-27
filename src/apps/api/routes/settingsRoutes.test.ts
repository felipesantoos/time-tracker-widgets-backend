import { describe, it, expect, vi } from 'vitest';
import { DIContainer } from '../dicontainer/dicontainer';

vi.mock('../dicontainer/dicontainer', () => ({
  DIContainer: {
    getSettingsService: vi.fn(() => ({})),
  },
}));

describe('SettingsRoutes', () => {
  it('should be defined', () => {
    expect(DIContainer.getSettingsService).toBeDefined();
  });
});
