// credit: https://github.com/justsml/guides/tree/master/express/setup-guide
import type { DbAdapter } from "@/config";
import type { Request, Response, NextFunction } from "express";
import express from "express";
import { logger } from "@/common/logger";
import { UserError } from "@/factService/errors";
import { getDataAdapter } from "@/providers";

export function queryRouter(adapter: DbAdapter) {
  const factsDbClient = getDataAdapter(adapter);

  return express
    .Router()
    .get(
      "/:keyPrefix*",
      function findByKeyPrefix(
        request: Request,
        response: Response,
        next: NextFunction,
      ) {
        const { keyPrefix } = request.params;

        if (!keyPrefix || typeof keyPrefix !== "string")
          return next(UserError("Key is required!"));

        logger.debug("find(%s*)", keyPrefix);
        return factsDbClient
          .find({ keyPrefix })
          .then((facts) => response.status(200).json(facts))
          .catch(next);
      },
    );
}
