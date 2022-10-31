// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import express, { Request, Response, NextFunction } from "express";
import factsClient from "./client";
import { getQueryOptions } from "../../utils/route-utils";
import UserError from "./userError";

const router = express.Router();

export default router
  .get("/", findByPath)
  .get("/:id", getById)
  .put("/", create)
  .post("/:id", update)
  .delete("/:id", remove);

// TODO: Add data validation before inserting into database! Examples: regex, mongoose, Zod, bookshelf, JSON Schema, etc.

function findByPath(request: Request, response: Response, next: NextFunction) {
  const { limit, offset, orderBy } = getQueryOptions(request.query);
  let {path, key} = request.query;
  if (path == undefined || `${path}`.length < 1) return next(new UserError("Path is required!"));
  if (key == undefined || `${key}`.length < 1) return next(new UserError("Key is required!"));
  path = `${path}`;
  key = `${key}`.split(',');
  factsClient.findByPath({ path, key, limit, offset, orderBy })
    .then((facts) => response.status(200).send({ data: facts }))
    .catch(next);
}

function getById(request: Request, response: Response, next: NextFunction) {
  factsClient
    .getById(Number(request.params.id))
    .then(([item]) => response.status(200).send({ data: item }))
    .catch(next);
}

function create(request: Request, response: Response, next: NextFunction) {
  let {path, key} = request.body;
  if (path == undefined || `${path}`.length < 1) return next(new UserError("Path is required!"));
  if (key == undefined || `${key}`.length < 1) return next(new UserError("Key is required!"));
  factsClient
    .create(request.body)
    .then((data) => response.status(201).json({ data }))
    .catch(next);
}

function update(request: Request, response: Response, next: NextFunction) {
  const { id } = request.params;
  if (id == undefined || `${id}`.length < 1) return next(new UserError("Id is required!"));
  let {path, key, value} = request.body;
  if (path == undefined || `${path}`.length < 1) return next(new UserError("Path is required!"));
  if (key == undefined || `${key}`.length < 1) return next(new UserError("Key is required!"));
  
  factsClient
    .update({id, path, key, value})
    .then((count) =>
      count >= 1
        ? response.status(200).json({ data: request.body })
        : response.status(410).json()
    )
    .catch(next);
}

function remove(request: Request, response: Response, next: NextFunction) {
  const { id } = request.params;
  if (id == undefined || `${id}`.length < 1) return next(new UserError("Id is required!"));

  factsClient
    .remove(BigInt(id))
    .then((count) =>
      count >= 1
        ? response.status(204).json()
        : response.status(404).json({ message: "Nothing deleted!" })
    )
    .catch(next);
}

// `/modules/facts/api.{js,ts}`
