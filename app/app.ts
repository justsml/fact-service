/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import express, {
  application,
  Request,
  Response,
  NextFunction,
  Handler,
  Application,
} from "express";
import ms from "ms";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import UserError from "../common/userError";
import FactRouter from "../lib/factService/router";
import { verifyTokenMiddleware } from "../middleware/auth";
import extractRoutes from "../lib/extractRoutes";
import { expressOpenApi } from "../lib/openApi/setup";
import openApp from "../lib/openApi";

const logMode = process.env.NODE_ENV !== "production" ? "dev" : "combined";

// const routeData = extractRoutes(FactRouter, {});
// console.log("Routes:", routeData);
// const _use = application.use;

// const _customUse = function _customUse(this: Application, ...args: any[]) {
//   console.log("USE", arguments);
//   if (typeof args[0] === "function")
//     return _use.call(this, fn);
//   if (typeof fn === "function") {
//     console.log("USE", path, fn.name);
//     return _use.call(this, path, fn);
//   }
//   return this;
// };

// application.use = _customUse;
export default () => {
  const app = expressOpenApi({
    title: "Test",
    description: "This is a test",
    version: "1.0.0",
    contact: {
      name: "Test",
      email: "dan@danlevy.net",
      url: "https://danlevy.net",
    },
    tags: {
      test: "Test",
    },
  })
  
    return app
      .use(helmet())
      .use(express.query({ parseArrays: false }))
      .use(express.json())
      .use(express.urlencoded({ extended: false }))
      .use(morgan(logMode))
      .use(cors({ origin: true, credentials: true, maxAge: ms("1 month") }))
      .use(verifyTokenMiddleware)
      .use("/api/facts", FactRouter)
      .use("/v1/api/facts", FactRouter)
      .get("/", (req, res) => res.send({ ok: true, message: "Hello World!" }))
      .get("/_healthcheck", (req, res) => res.send({ ok: true }))
      .use(notFoundHandler)
      .use(errorHandler);
}

function notFoundHandler(request: Request, response: Response) {
  response
    .status(404)
    .send({ error: "Not found!", status: 404, url: request.originalUrl });
}

function errorHandler(
  error: Error & { status?: number },
  request: Request,
  response: Response,
  next: NextFunction,
) {
  console.error("ERROR", error);
  const stack = process.env.NODE_ENV !== "production" ? error.stack : undefined;
  const status = error?.status ?? 500;
  response.status(status);
  if (error instanceof UserError || error.name === "UserError") {
    response.status(400).json({ error: error.message });
  } else {
    response.send({ error: error.message, stack, url: request.originalUrl });
  }
}
