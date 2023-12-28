import { appEnv, logLevel } from "../lib/config";

import pino from "pino";
import pinoHttp from "pino-http";
import pretty from "pino-pretty";

export const logStream =
  appEnv === "development"
    ? pretty({
        colorize: true,
        singleLine: true,
        ignore: "res.headers,req.headers",
      })
    : process.stdout;

export const logger = pino(
  {
    level: logLevel,
  },
  logStream,
);

export const httpLogger = pinoHttp({
  stream: logStream,
  level: logLevel,
});
