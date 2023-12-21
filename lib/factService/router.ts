// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import express, { Request, Response, NextFunction } from "express";
import UserError from "../../common/userError";
import { createTable, dropTable } from "../providers/dynamoDb/adapter";
import type { BatchResultMessage, FactAdapter } from "./types";

const keyPathPattern = "/:key([a-zA-Z0-9-:/]{0,})";

// dropTable().then(() => console.log("Table dropped!"));
// createTable().then(() => console.log("Table created!"));

export function factApiRouter(factsDbClient: FactAdapter) {
  return express
    .Router()
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

    console.log("getById(%s)", key);
    if (!key) return next(new UserError("Key is required!"));

    if (keyPrefix != null && `${keyPrefix}`.length >= 1) {
      return factsDbClient.find({ keyPrefix: `${keyPrefix}` })
      .then((facts) => response.status(200).json(facts))
      .catch(next);
    }

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
      .set({ key, fact: payload })
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

    console.log("Removing %s", key);
    factsDbClient
      .del({ key })
      .then((deleted) =>
        deleted.message
          ? response.status(204).json(deleted.message)
          : response.status(404).json({ message: "Nothing deleted!" }),
      )
      .catch(next);
  }
}

export function statsApiRouter(factsDbClient: FactAdapter) {
  return express
    .Router()
    .route("/stats/:mode?")
    .get((req, res) => res.status(420).json({ message: "Not implemented!" }));

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
