// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import express from "express";
import type { Request, Response, NextFunction } from "express";
// import { request } from "http";
import { logger } from "../../common/logger";
import UserError from "../../common/userError";
// import { createTable, dropTable } from "../providers/dynamoDb/adapter";
import type { FactAdapter } from "./types";

const keyPathPattern = "/:key([a-zA-Z0-9-:/]{0,})";

// dropTable().then(() => logger.log("Table dropped!"));
// createTable().then(() => logger.log("Table created!"));

export function factApiRouter(factsDbClient: FactAdapter) {
  return express
    .Router()
    .use((_request, response, next) => {
      response.set({
        "X-Service-Name": "fact-service",
        "X-DB-Adapter": factsDbClient._name,
      });
      next();
    })
    .get(keyPathPattern, getById)
    .put(keyPathPattern, create)
    .post(keyPathPattern, create)
    .delete(keyPathPattern, remove);

  async function getById(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const { key } = request.params;
    const { keyPrefix } = request.query;

    if (!key && !keyPrefix) return next(new UserError("Key is required!"));

    if (keyPrefix != null && `${keyPrefix}`.length >= 1) {
      logger.debug("getByPrefix(%s*)", keyPrefix);
      return factsDbClient
        .find({ keyPrefix: `${keyPrefix}` })
        .then((facts) => response.status(200).json(facts))
        .catch(next);
    }

    logger.debug("getById(%s)", key);

    factsDbClient
      .get({ key })
      .then((facts) => response.status(200).json(facts))
      .catch(next);
  }

  function create(request: Request, response: Response, next: NextFunction) {
    const { key } = request.params;
    const { ...payload } = request.body;
    if (key == undefined || `${key}`.length < 1)
      return next(new UserError("Key is required!"));
    if (payload == undefined || `${payload}`.length < 1)
      return next(new UserError("payload is required!"));

    factsDbClient
      .set({ key, value: payload })
      .then((facts) => response.status(201).json(facts))
      .catch(next);
  }

  /**
   * TODO: Untangle this poor confused function...
   */
  function remove(request: Request, response: Response, next: NextFunction) {
    const { key } = request.params;
    if (key == undefined || `${key}`.length < 1)
      return next(new UserError("key is required!"));

    logger.info("Removing %s", key);
    factsDbClient
      .del({ key })
      .then((deleted) =>
        deleted.count > 0
          ? response.status(204).json(deleted)
          : response.status(404).json({ message: "Key not found!" }),
      )
      .catch(next);
  }
}

export function statsApiRouter(_factsDbClient: FactAdapter) {
  return express
    .Router()
    .route("/stats/:mode?")
    .get((_req, res) => res.status(420).json({ message: "Not implemented!" }));

  // function getFactStats(
  //   request: Request,
  //   response: Response,
  //   next: NextFunction,
  // ) {
  //   if (request.params.mode === "path-count") {
  //     return factsDbClient
  //       .getPathCounts()
  //       .then((facts) => response.status(200).json(facts))
  //       .catch(next);
  //   }
  //   return response
  //     .status(404)
  //     .json({ message: `Unrecognized mode: ${request.params.mode}` });
  // }
}
