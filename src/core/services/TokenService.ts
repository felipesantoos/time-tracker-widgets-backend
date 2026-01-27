import { randomBytes } from "crypto";
import { AccessToken } from "../domains/token";
import { ITokenService } from "../interfaces/primary/ITokenService";
import { ITokenRepository } from "../interfaces/secondary/ITokenRepository";

export class TokenService implements ITokenService {
  constructor(private readonly tokenRepository: ITokenRepository) {}

  async createToken(userId: string): Promise<AccessToken> {
    const token = randomBytes(32).toString("hex");
    return this.tokenRepository.create({ userId, token });
  }

  async listTokens(userId: string): Promise<Partial<AccessToken>[]> {
    return this.tokenRepository.findManyByUserId(userId);
  }

  async deleteToken(userId: string, id: string): Promise<void> {
    const existing = await this.tokenRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new Error("Token not found");
    }
    await this.tokenRepository.delete(id);
  }

  async validateToken(token: string): Promise<string | null> {
    const accessToken = await this.tokenRepository.findByToken(token);
    
    if (!accessToken) {
      return null;
    }

    // Update last usage asynchronously (fire and forget or await depending on preference)
    // Here we use await to ensure the record is made before proceeding
    await this.tokenRepository.update(accessToken.id, {
      lastUsedAt: new Date(),
    });

    return accessToken.userId;
  }
}
