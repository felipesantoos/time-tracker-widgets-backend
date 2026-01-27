import { AccessToken } from "../../domains/token";

export interface ITokenService {
  createToken(userId: string): Promise<AccessToken>;
  listTokens(userId: string): Promise<Partial<AccessToken>[]>;
  deleteToken(userId: string, id: string): Promise<void>;
  validateToken(token: string): Promise<string | null>;
}
