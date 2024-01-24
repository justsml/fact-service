import type { ErrorHandler } from "elysia";

export const errorHandler: ErrorHandler = ({ code, error }) => {
  console.log("onError", { code, error });
  return new Response(
    JSON.stringify({ code, error: error.toString(), message: error.message }),
  );
};
