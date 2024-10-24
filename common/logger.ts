import { config } from "../lib/config";

import pino from "pino";
import pinoHttp from "pino-http";
import pretty from "pino-pretty";

const { appEnv, logLevel } = config;

export const logStream =
  appEnv === "production"
    ? process.stdout
    : pretty({
        colorize: true,
        singleLine: true,
        ignore: "res.headers,req.headers",
      });

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
