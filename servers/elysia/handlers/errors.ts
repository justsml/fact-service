import type { ErrorHandler } from "elysia";
import { logger } from "@/common/logger";
// import e from "express";

export const errorHandler: ErrorHandler = ({ error, path, query, request }) => {
  logger.info(error, "onError %j", {
    message: error.message,
    method: `${request.method}`.toUpperCase(),
    path,
    query,
    dest: request.destination,
    error: error.toString(),
    stack: error.stack,
  });
  if ("getResponse" in error && typeof error.getResponse === "function") {
    return error.getResponse();
      

    // if (error.code === "USER_ERROR")
    //   return new Response(JSON.stringify({ message: error.message }), {
    //     status: 400,
    //   });
  }
  return new Response(
    JSON.stringify({ path, error: error.toString(), message: error.message }),
  );
};
