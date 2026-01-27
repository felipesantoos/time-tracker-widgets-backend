import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { SettingsService } from './SettingsService';
import { ISettingsRepository } from '../interfaces/secondary/ISettingsRepository';
import { PomodoroSettings } from '../domains/settings';

describe('SettingsService', () => {
  let settingsService: SettingsService;
  let mockSettingsRepository: Mocked<ISettingsRepository>;

  beforeEach(() => {
    mockSettingsRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    } as any;

    settingsService = new SettingsService(mockSettingsRepository);
  });

  const mockSettings: PomodoroSettings = {
    id: 'settings-1',
    userId: 'user-1',
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreak: false,
  };

  describe('getPomodoroSettings', () => {
    it('should return existing settings if found', async () => {
      mockSettingsRepository.findByUserId.mockResolvedValue(mockSettings);

      const result = await settingsService.getPomodoroSettings('user-1');

      expect(result).toEqual(mockSettings);
      expect(mockSettingsRepository.create).not.toHaveBeenCalled();
    });

    it('should create and return default settings if none found', async () => {
      mockSettingsRepository.findByUserId.mockResolvedValue(null);
      mockSettingsRepository.create.mockResolvedValue(mockSettings);

      const result = await settingsService.getPomodoroSettings('user-1');

      expect(result).toEqual(mockSettings);
      expect(mockSettingsRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
        autoStartBreak: false,
      });
    });
  });

  describe('updatePomodoroSettings', () => {
    it('should upsert settings', async () => {
      const updateData = { workMinutes: 30 };
      mockSettingsRepository.upsert.mockResolvedValue({ ...mockSettings, ...updateData });

      const result = await settingsService.updatePomodoroSettings('user-1', updateData);

      expect(result.workMinutes).toBe(30);
      expect(mockSettingsRepository.upsert).toHaveBeenCalledWith('user-1', updateData);
    });
  });
});
