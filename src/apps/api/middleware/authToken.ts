import { Request, Response, NextFunction } from "express";
import { DIContainer } from "../dicontainer/dicontainer";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const tokenService = DIContainer.getTokenService();

export const authToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;

    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring("Bearer ".length).trim();
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const userId = await tokenService.validateToken(token);

    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = userId;

    return next();
  } catch (err) {
    // Do not leak error details here
    return res.status(500).json({ error: "Authentication error" });
  }
};
