import { describe, it, expect, vi } from 'vitest';
import { DIContainer } from '../dicontainer/dicontainer';

vi.mock('../dicontainer/dicontainer', () => ({
  DIContainer: {
    getReportService: vi.fn(() => ({})),
  },
}));

describe('ReportRoutes', () => {
  it('should be defined', () => {
    expect(DIContainer.getReportService).toBeDefined();
  });
});
