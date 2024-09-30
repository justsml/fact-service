// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import type { DbAdapter } from "@/config";
import type { Request, Response, NextFunction } from "express";
import express from "express";
import { logger } from "@/common/logger";
import { UserError } from "@/factService/errors";
import { getDataAdapter } from "@/providers";

export function factsRouter(adapter: DbAdapter) {
  const factsDbClient = getDataAdapter(adapter);

  return express
    .Router()
    .get("/:key*", getById)
    .put("/:key*", create)
    .post("/:key*", create)
    .delete("/:key*", remove);

  async function getById(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const { key } = request.params;
    if (key == null) return next(UserError("Key is required!"));

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
      return next(UserError("Key is required!"));
    if (payload == undefined || `${payload}`.length < 1)
      return next(UserError("payload is required!"));

    logger.debug("create(%s)", key);
    factsDbClient
      .set({ key, value: payload })
      .then((facts) => response.status(201).json(facts))
      .catch(next);
  }

  function remove(request: Request, response: Response, next: NextFunction) {
    const { key } = request.params;
    if (key == undefined || `${key}`.length < 1)
      return next(UserError("key is required!"));

    logger.debug("remove(%s)", key);
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
