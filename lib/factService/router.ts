// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import express, { Request, Response, NextFunction } from "express";
import factsDbClient from "./clientDb";
import { getQueryOptions } from "../../common/routeUtils";
import UserError from "../../common/userError";

const router = express.Router();

export default router
  .get("/", findFactsByPathKeys)
  .get("/:id", getByIdOrPath)
  .put("/", create)
  .post("/:id", update)
  .delete("/:id", remove);

function findFactsByPathKeys(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { limit, offset, orderBy } = getQueryOptions(request.query);
  let { path, key } = request.query;
  if (path == undefined || `${path}`.length < 1)
    return next(new UserError("Path is required!"));
  if (key == undefined || `${key}`.length < 1)
    return next(new UserError("Key is required!"));
  path = `${path}`;
  key = `${key}`.split(",");
  factsDbClient
    .findFactsByPathKeys({ path, key, limit, offset, orderBy })
    .then((facts) => response.status(200).send({ facts }))
    .catch(next);
}

function getByIdOrPath(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  let { id } = request.params;
  if (id == undefined || `${id}`.length < 1)
    return next(new UserError("Id/Path is required!"));
  factsDbClient
    .findAllFactsByPath({ path: id, limit: 200 })
    .then((facts) => response.status(200).send(facts))
    .catch(next);
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
    .then((facts) => response.status(201).json({ facts }))
    .catch(next);
}

function update(request: Request, response: Response, next: NextFunction) {
  const { id } = request.params;
  if (id == undefined || `${id}`.length < 1)
    return next(new UserError("Id is required!"));
  let { path, key, value } = request.body;
  if (path == undefined || `${path}`.length < 1)
    return next(new UserError("Path is required!"));
  if (key == undefined || `${key}`.length < 1)
    return next(new UserError("Key is required!"));

  factsDbClient
    .update({ id, path, key, value, updated_at: new Date() })
    .then((updated) =>
      updated.length >= 1
        ? response.status(200).json({ updated })
        : response.status(410).json(),
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
