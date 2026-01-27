import { describe, it, expect } from 'vitest';
import { SettingsMapper } from './settingsMapper';
import { PomodoroSettings } from '../../../core/domains/settings';

describe('SettingsMapper', () => {
  const mockSettings: PomodoroSettings = {
    id: 's1',
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreak: false,
    userId: 'user-1',
  };

  describe('toResponse', () => {
    it('should map PomodoroSettings domain to a response DTO', () => {
      const result = SettingsMapper.toResponse(mockSettings);
      expect(result).toEqual(mockSettings);
    });
  });
});
