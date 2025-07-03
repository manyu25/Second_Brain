import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_USER_SECRET } from "./config";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_USER_SECRET) as { id: string };
    (req as any).userId = decoded.id;
    next();
  } catch (error) {
    console.error("JWT error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
