import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";
import sendResponse from "../utils/sendResponse";

const isVerified = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access!",
        });
      }

      let decoded: JwtPayload;

      try {
        decoded = jwt.verify(token, config.secret as string) as JwtPayload;
      } catch (err: any) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message:
            err.name === "TokenExpiredError"
              ? "Unauthorized: Token expired"
              : "Unauthorized: Invalid token",
        });
      }

      const userData = await pool.query(
        `
      SELECT * FROM users WHERE email=$1
      `,
        [decoded.email],
      );

      const user = userData.rows[0];

      if (!user) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: User not found!",
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!",
        });
      }

      req.user = decoded;

      return next();
    } catch (error) {
      next(error);
    }
  };
};

export default isVerified;
