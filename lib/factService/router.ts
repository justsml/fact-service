// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import express, { Request, Response, NextFunction } from "express";
import factsDbClient from "./clientDb";
import { getQueryOptions } from "../../common/routeUtils";
import UserError from "../../common/userError";
import type { BatchResultMessage } from "./types";
import { extractPathAndKeys } from "./factHelpers";

export default express
  .Router()
  // check stats first
  .get("/stats/:mode?", getFactStats)
  .get("/:path/:key?", getByIdOrPath)
  .get("/", findFactsByPathKeys)
  .put("/", create)
  .post("/:path/:key?", updateByPathOrId)
  .post("/:id", updateByPathOrId)
  .post("/", create)
  .delete("/:id", remove);

// Determine if we are asked to query path counts or a find by path
function getFactStats(request: Request, response: Response, next: NextFunction) {
  if (request.params.mode === "path-count") {
    return factsDbClient
      .getPathCounts()
      .then((facts) => response.status(200).json(facts))
      .catch(next);
  }
  return response.status(404).json({message: `Unrecognized mode: ${request.params.mode}`});
}

function findFactsByPathKeys(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  console.log("findFactsByPathKeys: request.query", request.query);
  const { limit, offset, orderBy } = getQueryOptions(request.query);
  const { path, key } = extractPathAndKeys(request);
  
  // if (path == undefined || `${path}`.length < 1)
  //   return next(new UserError("Path is required!"));
  // if (key == undefined || `${key}`.length < 1)
  //   return next(new UserError("Key is required!"));
  factsDbClient
    .findFactsByPathKeys({ path, key, limit, offset, orderBy })
    .then((facts) => response.status(200).json(facts))
    .catch(next);
}

async function getByIdOrPath(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { path, key } = extractPathAndKeys(request);
  if (path == undefined || `${path}`.length < 1)
    return next(new UserError("Path is required!"));
  console.log("getByIdOrPath.params", request.params);
  console.log("getByIdOrPath.query", request.query);
  console.log({ path, key });
  if (!key) {
  console.log('getByIdOrPath.querying', { path });
  factsDbClient
      .findAllFactsByPath({ path: path as string, limit: 200 })
      .then((facts) => response.status(200).json(facts))
      .catch(next);
  } else {
  console.log('querying', { path, key });
  factsDbClient
      .findFactsByPathKeys({ path: `${path}`, key: `${key}`, limit: 10 })
      .then((facts) => response.status(200).json(facts))
      .catch(next);
  }
}

function create(request: Request, response: Response, next: NextFunction) {
  let { path, key, value } = request.body;
  if (path == undefined || `${path}`.length < 1)
    return next(new UserError("Path is required!"));
  if (key == undefined || `${key}`.length < 1)
    return next(new UserError("Key is required!"));
  if (value == undefined || `${value}`.length < 1)
    return next(new UserError("Value is required!"));

  factsDbClient
    .create({ path, key, value })
    .then((facts) => response.status(201).json(facts))
    .catch(next);
}

/**
 * TODO: Untangle this poor confused function...
 */
function updateByPathOrId(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { id, path, key } = request.params;
  let update: undefined | Record<string, string> =
    id != undefined
      ? { id }
      : path != undefined && key != undefined
      ? { path, key }
      : undefined;
  let fact = request.body;
  let factsUpdatePromise = null;
  if (typeof update === "object" && update != null) {
    const isIdInPath = "id" in update && typeof update.id === "string";

    const isPathKeyInPath = (update: Record<string, string>) =>
      "path" in update &&
      typeof update.path === "string" &&
      "key" in update &&
      update.key != undefined;

    if (isPathKeyInPath(update)) {
      update = { path: update.path, key: update.key };
      console.log(
        "Updating fact by [path=%s key=%s] with %o",
        update.path,
        update.key,
        fact,
      );
      // Updates any/all of a facts' value by it's *current* path and key
      factsUpdatePromise = factsDbClient.updateByPathKey(
        { path, key },
        {
          path: fact.path,
          key: fact.key,
          value: fact.value,
          updated_at: new Date(),
        },
      );
    } else if (isIdInPath) {
      console.log("Updating fact by [id=%s] with %o", update.id, fact);
      update.id = isIdInPath ? update.id : fact.id;
      factsUpdatePromise = factsDbClient.updateById({
        id,
        path,
        key,
        value: fact.value,
        updated_at: new Date(),
      });
    } else {
      return next(
        new UserError(
          "Updates require either a Path & Key, or Id in the path! " +
            JSON.stringify(request.params),
        ),
      );
    }
  }

  Promise.resolve(factsUpdatePromise)
    .then((updated) =>
      updated != null && updated?.length >= 1
        ? response.status(200).json({
            count: updated.length,
            message: updated.length > 0 ? "success" : "oh noes",
            success: updated.length > 0,
          } as BatchResultMessage)
        : response.status(410).json({
            success: false,
            message: "no records updated",
            count: 0,
          }),
    )
    .catch(next);
}

function remove(request: Request, response: Response, next: NextFunction) {
  const { id } = request.params;
  if (id == undefined || `${id}`.length < 1)
    return next(new UserError("Id is required!"));

  factsDbClient
    .removeById(BigInt(id))
    .then((deleted) =>
      deleted.message
        ? response.status(204).json(deleted.message)
        : response.status(404).json({ message: "Nothing deleted!" }),
    )
    .catch(next);
}

// `/modules/facts/api.{js,ts}`
