// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import express, { Request, Response, NextFunction } from "express";
// import { getQueryOptions } from "../../common/routeUtils";
import UserError from "../../common/userError";
import { createTable } from "../providers/dynamoDb";
import type { BatchResultMessage, FactAdapter } from "./types";
// import { getKeyFromParamsOrQuery } from "./factHelpers";

// TODO: Cleanup
// Example Express Path Patterns:
// /api/:path([A-Za-z0-9\/\-_'":;,\.\[\]$#@!%^&*+={}<>?|]{0,})
// /:key([A-Za-z0-9\/\-@#$:.=]{0,})
// /:id([0-9]{1,})
// /:key([.]{0,})

const keyPathPattern = "/:key([a-zA-Z0-9-:/]{0,})";

createTable();

export function factApiRouter(factsDbClient: FactAdapter) {
  return express
    .Router()
    .get(keyPathPattern, getById)
    .put(keyPathPattern, create)
    .post(keyPathPattern, update)
    .delete(keyPathPattern, remove);

  async function getById(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const { key } = request.params;
    console.log("getById(%s)", key);
    if (!key) return next(new UserError("Key is required!"));

    if (key !== "/" && key.length < 1) {
      const { keyPrefix } = request.query;
      if (!keyPrefix || `${keyPrefix}`.length < 1) return next(new UserError("keyPrefix is required! e.g. ?keyPrefix=user"));
      return factsDbClient.find({ keyPrefix: `${keyPrefix}` });
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
  async function update(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const { key } = request.params;
    let fact = request.body;

    // Updates any/all of a facts' value by it's *current* path and key
    const updatedRow = await factsDbClient.set({ key, fact });

    Promise.resolve(updatedRow)
      .then((row) => {
        const updated = Array.isArray(row) ? row : [row];
        return updated != null && Array.isArray(updated)
          ? response.status(200).json({
              count: updated.length,
              message: updated.length > 0 ? "success" : "oh noes",
              success: updated.length > 0,
            } as BatchResultMessage)
          : response.status(410).json({
              success: false,
              message: "no records updated",
              count: 0,
            });
      })
      .catch(next);
  }

  function remove(request: Request, response: Response, next: NextFunction) {
    const { key } = request.params;
    if (key == undefined || `${key}`.length < 1)
      return next(new UserError("key is required!"));

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
