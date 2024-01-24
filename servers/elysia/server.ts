import { Elysia, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { logger } from "@/common/logger";
import type { FactAdapter } from "@/factService/types";
import UserError from "../../common/userError";
import { openApi } from "./handlers/swagger";
import { errorHandler } from "./handlers/errors";
import swagger from "@elysiajs/swagger";

export type FactApp = ReturnType<typeof getServer>;

export function getServer(factsDbClient: FactAdapter) {
  const app = new Elysia();

  return app
    .onError(errorHandler)
    .use(cors())
    .use(bearer())

    .use(
      swagger({
        path: "/swagger.yml",
        documentation: {
          info: {
            title: "Fact Service",
            version: "1.0.0",
            description: "Fact Service API",
          },
          components: {},
        },
      }),
    )
    .get("/api/facts/*", ({ params, query }) => {
      const key = params["*"];
      const { keyPrefix } = query;

      if (!key && !keyPrefix) throw new UserError("Key is required!");

      if (keyPrefix != null && `${keyPrefix}`.length >= 1) {
        logger.debug("getByPrefix(%s*)", keyPrefix);
        return factsDbClient
          .find({ keyPrefix: `${keyPrefix}` })
          .then((facts) => facts);
      }

      logger.debug("getById(%s)", key);

      return factsDbClient.get({ key }).then((facts) => facts);
    })
    .put(
      "/api/facts/*",
      ({ params, body }) => {
        const key = params["*"];
        let value = body;
        if (typeof body === "string") value = JSON.stringify(body);
        if (typeof body !== "object")
          throw new UserError("Value must be an object!");

        if (!key) throw new UserError("Key is required!");
        if (!value) throw new UserError("Value is required!");

        logger.debug("put(%s, %s)", key, value);

        return factsDbClient.set({ key, value }).then((facts) => facts);
      },
      { type: "json", body: t.Object({}, { additionalProperties: true }) },
    )

    .get(
      "/api/query/*",
      ({ query, params }) => {
        const { "*": key } = params;
        let { keyPrefix } = query;
        if (!keyPrefix) keyPrefix = key;

        if (!key && !keyPrefix) throw new UserError("Key is required!");

        if (keyPrefix != null && `${keyPrefix}`.length >= 1) {
          logger.debug("getByPrefix(%s*)", keyPrefix);
          return factsDbClient
            .find({ keyPrefix: `${keyPrefix}` })
            .then((facts) => facts);
        } else {
          throw new UserError("KeyPrefix is required!");
        }
      },
      {
        // params: t.Object({ '*': t.String() }, { description: "Key" }),
        detail: {
          description: "Get a fact by key",
          tags: ["facts"],
        },
      },
    )
    .use(openApi);
  // .use(() =>
  //   new Elysia({ prefix: "/api/facts", name: "facts" })
  //   .get("/*", ({ params, query }) => {
  //     const key = params["*"];
  //     const { keyPrefix } = query;

  //     if (!key && !keyPrefix) throw new UserError("Key is required!");

  //     if (keyPrefix != null && `${keyPrefix}`.length >= 1) {
  //       logger.debug("getByPrefix(%s*)", keyPrefix);
  //       return factsDbClient
  //         .find({ keyPrefix: `${keyPrefix}` })
  //         .then((facts) => facts)
  //     }

  //     logger.debug("getById(%s)", key);

  //     return factsDbClient.get({ key }).then((facts) => facts);
  //   // }, {
  //   //   body: t.Nullable(t.Object({})),
  //   //   detail: {
  //   //     description: "Get a fact by key",
  //   //     tags: ["facts"],
  //   //   },

  //   }),
  // )
}
