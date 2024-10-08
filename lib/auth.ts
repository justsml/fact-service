import type { Handler } from "express";
import { allowedTokens } from "./config";
import { logger } from "../common/logger";

/**
 * Returns a middleware function that checks for a valid token in the request
 */
export const verifyTokenMiddleware: Handler = (request, response, next) => {
  const { headers } = request;
  const authHeader =
    headers["x-token"] ??
    headers["x-api-token"] ??
    headers["x-api-key"] ??
    headers["authorization"];

  const matched = allowedTokens.find((token) => authHeader?.includes(token));

  if (matched) return next();

  logger.warn(
    { allowedTokens, current: authHeader },
    "Unauthorized: Invalid Authorization. API Token is Required!",
  );

  return response.status(401).json({
    error: "Unauthorized: Invalid Authorization. API Token is Required!",
  });
};
