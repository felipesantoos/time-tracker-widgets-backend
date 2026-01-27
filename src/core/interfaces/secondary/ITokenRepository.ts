import { AccessToken } from "../../domains/token";

export interface ITokenRepository {
  create(token: Omit<AccessToken, "id" | "createdAt" | "lastUsedAt" | "revokedAt">): Promise<AccessToken>;
  findManyByUserId(userId: string): Promise<Partial<AccessToken>[]>;
  findByIdAndUserId(id: string, userId: string): Promise<AccessToken | null>;
  findByToken(token: string): Promise<AccessToken | null>;
  update(id: string, data: Partial<Omit<AccessToken, "id" | "token" | "userId" | "createdAt">>): Promise<AccessToken>;
  delete(id: string): Promise<void>;
}
