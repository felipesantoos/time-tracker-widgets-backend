import { NextFunction, Request, Response } from "express";
import { logger } from "../../../infra/logging/Logger";

// Simple error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = (req as any).id;
  
  logger.error({
    err,
    requestId,
    url: req.url,
    method: req.method,
  }, "Unhandled Exception");

  return res.status(500).json({ 
    error: "Internal server error",
    requestId 
  });
};
