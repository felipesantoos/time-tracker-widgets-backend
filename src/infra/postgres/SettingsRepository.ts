import { prisma } from "../../config/prisma";
import { PomodoroSettings } from "../../core/domains/settings";
import { SettingsMapper } from "./mappers/SettingsMapper";
import { ISettingsRepository } from "../../core/interfaces/secondary/ISettingsRepository";

export class SettingsRepository implements ISettingsRepository {
  async findByUserId(userId: string): Promise<PomodoroSettings | null> {
    const settings = await prisma.pomodoroSettings.findUnique({
      where: { userId },
    });
    return settings ? SettingsMapper.toDomain(settings) : null;
  }

  async create(settings: Omit<PomodoroSettings, "id">): Promise<PomodoroSettings> {
    const dto = SettingsMapper.toCreateDTO(settings);
    const created = await prisma.pomodoroSettings.create({
      data: dto,
    });
    return SettingsMapper.toDomain(created);
  }

  async upsert(userId: string, settings: Partial<Omit<PomodoroSettings, "id" | "userId">>): Promise<PomodoroSettings> {
    const dto = SettingsMapper.toUpdateDTO(settings);
    const upserted = await prisma.pomodoroSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        workMinutes: dto.workMinutes || 25,
        shortBreakMinutes: dto.shortBreakMinutes || 5,
        longBreakMinutes: dto.longBreakMinutes || 15,
        longBreakInterval: dto.longBreakInterval || 4,
        autoStartBreak: dto.autoStartBreak || false,
      },
    });
    return SettingsMapper.toDomain(upserted);
  }
}
