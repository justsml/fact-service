import pino from "pino";
import pinoHttp from "pino-http";
import pretty from "pino-pretty";

export const logStream = pretty({
  colorize: true,
  singleLine: true,
  ignore: "res.headers",
});

export const logger = pino(logStream);

export const httpLogger = pinoHttp({
  stream: logStream,
});
