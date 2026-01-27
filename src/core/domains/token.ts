export interface AccessToken {
  id: string;
  token: string;
  userId: string;
  createdAt: Date;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
}
