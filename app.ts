import express from "express";
import helmet from "helmet";
import cors from "cors";
import ms from "ms";
import { factApiRouter } from "./lib/factService/router";
import { verifyTokenMiddleware } from "./lib/auth";
import { httpLogger } from "./common/logger";
import { notFoundHandler, errorHandler } from "./common/routeUtils";
import { getDataAdapter } from "./lib/providers";

const dataAdapter = getDataAdapter();
const factRouter = factApiRouter(dataAdapter);

export default () =>
  express()
    .use(helmet())
    .use(express.query({ parseArrays: false }))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(httpLogger)
    .use(cors({ origin: true, credentials: true, maxAge: ms("1 month") }))
    .use(verifyTokenMiddleware)
    .use("/api/facts", factRouter)
    .use(notFoundHandler)
    .use(errorHandler);
