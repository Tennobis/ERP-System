import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No authorization header provided");
      res.status(401).json({ error: "No authorization header" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("Invalid authorization header format");
      res.status(401).json({ error: "Invalid authorization header format" });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log("Verifying token:", token.substring(0, 10) + "...");

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    // payload should have user id
    const userId = typeof payload === "object" && payload.id ? payload.id : null;
    if (!userId) {
      console.log("No user id in token payload");
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log("No user found for token");
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
