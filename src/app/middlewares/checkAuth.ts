/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";

import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import AppError from "../../errorHelpers/AppError";
import { Role } from "@prisma/client";
import config from "../config";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
      const accessToken = CookieUtils.getCookie(req, "accessToken");

      if (!sessionToken && !accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No token provided.");
      }

      let isAuthenticated = false;

      // 1. Try Better Auth Session Token
      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;

          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());
            console.log("Session Expiring Soon!!");
          }

          if (user.banned === true) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active.");
          }

          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
          }

          req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
          };
          isAuthenticated = true;
          return next();
        }
      }

      // 2. Fallback to Access Token (JWT)
      if (!isAuthenticated && accessToken) {
        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          config.ACCESS_TOKEN_SECRET as string,
        );

        if (!verifiedToken.success) {
          throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
        }

        const decodedData = verifiedToken.data as any;

        if (authRoles.length > 0 && !authRoles.includes(decodedData?.role as Role)) {
          throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }

        req.user = {
          userId: decodedData.userId,
          role: decodedData.role as Role,
          email: decodedData.email,
        };
        isAuthenticated = true;
        return next();
      }

      if (!isAuthenticated) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid or expired token.");
      }
    } catch (error: any) {
      next(error);
    }
  };