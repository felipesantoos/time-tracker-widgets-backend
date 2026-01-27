import { prisma } from "../../config/prisma";
import { AccessToken } from "../../core/domains/token";
import { TokenMapper } from "./mappers/TokenMapper";
import { ITokenRepository } from "../../core/interfaces/secondary/ITokenRepository";

export class TokenRepository implements ITokenRepository {
  async create(token: Omit<AccessToken, "id" | "createdAt" | "lastUsedAt" | "revokedAt">): Promise<AccessToken> {
    const dto = TokenMapper.toCreateDTO(token);
    const created = await prisma.accessToken.create({
      data: dto,
    });
    return TokenMapper.toDomain(created);
  }

  async findManyByUserId(userId: string): Promise<Partial<AccessToken>[] | any[]> {
    const tokens = await prisma.accessToken.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return tokens;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<AccessToken | null> {
    const token = await prisma.accessToken.findFirst({
      where: {
        id,
        userId,
      },
    });
    return token ? TokenMapper.toDomain(token) : null;
  }

  async findByToken(token: string): Promise<AccessToken | null> {
    const accessToken = await prisma.accessToken.findFirst({
      where: {
        token,
        revokedAt: null,
      },
    });
    return accessToken ? TokenMapper.toDomain(accessToken) : null;
  }

  async update(id: string, data: Partial<Omit<AccessToken, "id" | "token" | "userId" | "createdAt">>): Promise<AccessToken> {
    const updated = await prisma.accessToken.update({
      where: { id },
      data,
    });
    return TokenMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.accessToken.delete({
      where: { id },
    });
  }
}
