import { Request, Response, NextFunction } from "express";
import { appEnv } from "../lib/config";
import { logger } from "./logger";
import UserError from "./userError";

export function notFoundHandler(request: Request, response: Response) {
  response
    .status(404)
    .send({ error: "Not found!", status: 404, url: request.originalUrl });
}

export function errorHandler(
  error: Error & { status?: number },
  request: Request,
  response: Response,
  next: NextFunction,
) {
  logger.error("ERROR", error);
  const stack = process.env.NODE_ENV !== "production" ? error.stack : undefined;
  const status = error?.status ?? 500;
  response.status(status);
  if (error instanceof UserError || error.name === "UserError") {
    response.status(400).json({ error: error.message });
  } else {
    response.send({ error: error.message, stack, url: request.originalUrl });
  }
}

// export interface IQueryParameters {
//   limit?: number;
//   offset?: number;
//   orderBy?: [string, "asc" | "desc"];
// }

export function getQueryOptions(
  query: {
    offset?: number;
    limit?: number;
    orderBy?: string;
  },
  { defaultOffset = 0, defaultLimit = 20, defaultOrderBy = "-id" } = {},
) {
  let {
    offset = defaultOffset,
    limit = defaultLimit,
    orderBy = defaultOrderBy,
  } = query;
  offset = Math.abs(parseInt(`${offset}`, 10));
  limit = Math.abs(parseInt(`${limit}`, 10));
  const orderByPair: [string, "asc" | "desc"] =
    orderBy[0] === "-" ? [orderBy.slice(1), "desc"] : [orderBy, "asc"];
  offset = offset > 100000 ? 100000 : offset;
  limit = limit > 100 ? 100 : limit;
  return { offset, limit, orderBy: orderByPair };
}

export const checkPostgresError =
  <TContextType = unknown>(context: TContextType | undefined) =>
  (error: Error) => {
    checkInvalidInputError(context)(error);
    checkDuplicateKeyError(context)(error);
    checkRelationError(context)(error);
    throw error;
  };

export const checkInvalidInputError =
  <TContextType = unknown>(context: TContextType | undefined) =>
  (error: Error) => {
    if (appEnv !== "development") context = undefined;

    logger.error("ERROR", error);
    const msg = error.message;
    const lastPart = msg.split(`invalid input`)[1];
    if (lastPart) throw new UserError(`Database Error: ${lastPart}`);
    throw error;
  };

export const checkDuplicateKeyError =
  <TContextType = unknown>(context: TContextType | undefined) =>
  (error: Error) => {
    if (appEnv !== "development") context = undefined;
    if (error.message.includes("duplicate key")) {
      throw new UserError(
        `Fact already exists! Context: ${JSON.stringify(context)}`,
      );
    }
    throw error;
  };

export const checkRelationError =
  <TContextType = unknown>(context: TContextType | undefined) =>
  (error: Error) => {
    if (appEnv !== "development") context = undefined;
    if (error.message.includes("of relation")) {
      const msg = error.message
        .split(" - column")[1]
        .replace("relation", "table");
      throw new UserError(
        `Database error: ${msg}. Context: ${JSON.stringify(context)}`,
      );
    }
    throw error;
  };
