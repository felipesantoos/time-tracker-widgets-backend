import { AccessToken } from "../../../core/domains/token";
import { AccessTokenResponse } from "../dtos/response/token";

export class TokenMapper {
  static toResponse(domain: AccessToken): AccessTokenResponse {
    return {
      id: domain.id,
      token: domain.token,
      userId: domain.userId,
      createdAt: domain.createdAt,
      lastUsedAt: domain.lastUsedAt,
      revokedAt: domain.revokedAt,
    };
  }
}
