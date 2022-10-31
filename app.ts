/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
// import cors from "cors";
import FactRouter from "./lib/factService/router";
import UserError from "./common/userError";

const logMode = process.env.NODE_ENV !== "production" ? "dev" : "combined";

export default () => express()
  .use(helmet())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(morgan(logMode))
  //.use(cors({origin: true, credentials: true})) // Use only if you need CORS
  .use("/api/facts", FactRouter)
  .use(notFoundHandler)
  .use(errorHandler);

function notFoundHandler(request: Request, response: Response) {
  response
    .status(404)
    .send({ error: "Not found!", status: 404, url: request.originalUrl });
}

function errorHandler(
  error: Error & { status?: number },
  request: Request,
  response: Response,
  next: NextFunction
) {
  console.error("ERROR", error);
  const stack = process.env.NODE_ENV !== "production" ? error.stack : undefined;
  const status = error?.status ?? 500;
  response.status(status)
  if (error instanceof UserError || error.name === "UserError") {
    response.json({ error: error.message });
  } else {
    response.send({ error: error.message, stack, url: request.originalUrl });
  }
}
