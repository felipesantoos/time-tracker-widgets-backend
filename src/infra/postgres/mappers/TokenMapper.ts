import { AccessToken } from "../../../core/domains/token";
import { CreateTokenPostgresDTO } from "../dtos/TokenDTOs";

export class TokenMapper {
  static toDomain(prismaToken: any): AccessToken {
    return {
      id: prismaToken.id,
      token: prismaToken.token,
      userId: prismaToken.userId,
      createdAt: prismaToken.createdAt,
      lastUsedAt: prismaToken.lastUsedAt,
      revokedAt: prismaToken.revokedAt,
    };
  }

  static toDomainList(prismaTokens: any[]): AccessToken[] {
    return prismaTokens.map((t) => this.toDomain(t));
  }

  static toCreateDTO(token: Omit<AccessToken, "id" | "createdAt" | "lastUsedAt" | "revokedAt">): CreateTokenPostgresDTO {
    return {
      userId: token.userId,
      token: token.token,
    };
  }
}
