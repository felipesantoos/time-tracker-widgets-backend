import { prisma } from "../../config/prisma";
import { TimeSession, ActiveSession } from "../../core/domains/session";
import { SessionMapper } from "./mappers/SessionMapper";
import { ISessionRepository } from "../../core/interfaces/secondary/ISessionRepository";

export class SessionRepository implements ISessionRepository {
  async findMany(params: {
    userId: string;
    projectId?: string;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }): Promise<[TimeSession[], number]> {
    const { userId, projectId, from, to, skip, take } = params;

    const where: any = { userId };

    if (projectId) {
      where.projectId = projectId;
    }

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = from;
      if (to) where.startTime.lte = to;
    }

    const [sessions, total] = await Promise.all([
      prisma.timeSession.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          endTime: "desc",
        },
        skip,
        take,
      }),
      prisma.timeSession.count({ where }),
    ]);

    return [SessionMapper.toTimeSessionDomainList(sessions), total];
  }

  async findByIdAndUserId(id: string, userId: string): Promise<TimeSession | null> {
    const session = await prisma.timeSession.findFirst({
      where: { id, userId },
    });
    return session ? SessionMapper.toTimeSessionDomain(session) : null;
  }

  async create(session: Omit<TimeSession, "id">): Promise<TimeSession> {
    const dto = SessionMapper.toCreateDTO(session);
    const prismaData: any = {
      ...dto,
      user: { connect: { id: dto.userId } },
    };

    if (dto.projectId) {
      prismaData.project = { connect: { id: dto.projectId } };
      delete prismaData.projectId;
    }
    delete prismaData.userId;

    const created = await prisma.timeSession.create({
      data: prismaData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return SessionMapper.toTimeSessionDomain(created);
  }

  async update(id: string, session: Partial<Omit<TimeSession, "id" | "userId">>): Promise<TimeSession> {
    const dto = SessionMapper.toUpdateDTO(session);
    const prismaData: any = { ...dto };
    
    if (dto.projectId !== undefined) {
      prismaData.project = dto.projectId 
        ? { connect: { id: dto.projectId } } 
        : { disconnect: true };
      delete prismaData.projectId;
    }

    const updated = await prisma.timeSession.update({
      where: { id },
      data: prismaData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return SessionMapper.toTimeSessionDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.timeSession.delete({ where: { id } });
  }

  async findActiveByUserId(userId: string): Promise<ActiveSession | null> {
    const activeSession = await prisma.activeSession.findUnique({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return activeSession ? SessionMapper.toActiveSessionDomain(activeSession) : null;
  }

  async upsertActive(userId: string, session: Omit<ActiveSession, "id">): Promise<ActiveSession> {
    const dto = SessionMapper.toUpsertActiveDTO(session);
    const prismaData: any = { ...dto };

    if (dto.projectId !== undefined) {
      prismaData.project = dto.projectId 
        ? { connect: { id: dto.projectId } } 
        : { disconnect: true };
      delete prismaData.projectId;
    }
    delete prismaData.userId;

    const activeSession = await prisma.activeSession.upsert({
      where: { userId },
      update: prismaData,
      create: {
        ...prismaData,
        user: { connect: { id: userId } }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return SessionMapper.toActiveSessionDomain(activeSession);
  }

  async deleteActiveByUserId(userId: string): Promise<void> {
    await prisma.activeSession.delete({
      where: { userId },
    });
  }

  async createTimeSessionAndDeleteActive(
    session: Omit<TimeSession, "id">,
    userId: string
  ): Promise<TimeSession> {
    const dto = SessionMapper.toCreateDTO(session);
    const prismaData: any = {
      ...dto,
      user: { connect: { id: dto.userId } },
    };

    if (dto.projectId) {
      prismaData.project = { connect: { id: dto.projectId } };
      delete prismaData.projectId;
    }
    delete prismaData.userId;

    const result = await prisma.$transaction(async (tx: any) => {
      const timeSession = await tx.timeSession.create({
        data: prismaData,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      await tx.activeSession.delete({
        where: { userId },
      });

      return timeSession;
    });
    return SessionMapper.toTimeSessionDomain(result);
  }

  async findManyForReport(params: {
    userId: string;
    fromDate: Date;
    toDate: Date;
    mode?: "pomodoro";
  }): Promise<TimeSession[]> {
    const { userId, fromDate, toDate, mode } = params;
    const sessions = await prisma.timeSession.findMany({
      where: {
        userId,
        mode,
        startTime: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return SessionMapper.toTimeSessionDomainList(sessions);
  }
}
