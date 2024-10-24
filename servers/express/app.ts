import express from "express";
import helmet from "helmet";
import cors from "cors";
import ms from "ms";
import { verifyTokenMiddleware } from "@/auth";
import { httpLogger } from "@/common/logger";
import { notFoundHandler, errorHandler } from "@/common/routeUtils";
import { dbAdapter, type DbAdapter } from "@/config";
import { factsRouter } from "./routes/facts";
import { queryRouter } from "./routes/query";

// const dataAdapter = getDataAdapter();
// const factRouter = factsRouter(dataAdapter);

export default (adapter = dbAdapter as DbAdapter) =>
  express()
    .use(helmet())
    .use(express.query({ parseArrays: false }))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(httpLogger)
    .use(cors({ origin: true, credentials: true, maxAge: ms("1 month") }))
    .use(verifyTokenMiddleware)
    .use("/api/query", queryRouter(adapter))
    .use("/api/facts", factsRouter(adapter))
    .use(notFoundHandler)
    .use(errorHandler);
