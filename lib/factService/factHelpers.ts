import isArray from "lodash/isArray";
import type { Request } from "express";
import type EventEmitter from "events";

export const toCsvString = (value: any) =>
  value == null
    ? ""
    : isArray(value)
      ? value?.filter(Boolean)?.join(",")
      : `${value}`.split(",").filter(Boolean).join(",");

export const getKeyFromParamsOrQuery = (request: Request) => {
  let { key } = request.params;
  if (!key && request.query?.["key"])
    key = `${toCsvString(request.query?.["key"])}`;
  return { key };
};

/**
 * Register an error handler that will exit the process
 * if the error count exceeds the limit.
 */
export const registerErrorHandlerLimit = (
  events: EventEmitter,
  message: string = "Error: Check your configuration!",
  limit: number = 10,
) => {
  let errorCount = 0;
  events.on("error", (error) => {
    errorCount++;
    if (errorCount >= limit) {
      console.error(error, message + " %o", error);
      process.exit(1);
    }
  });
};
