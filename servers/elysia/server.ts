import { Elysia, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { logger } from "../../common/logger";
import {
  // type FactEntity,
  type FactAdapter,
  FactResponseTypeDef,
} from "../../lib/factService/types";
import openApi from "./handlers/swagger";
import { errorHandler } from "./handlers/errors";
import { UserError } from "../../lib/factService/errors";
import { logger as pinoLogger } from "@bogeychan/elysia-logger";

export type FactApp = ReturnType<typeof getServer>;
export type Put = FactApp["put"];
export function getServer(factsDbClient: FactAdapter) {
  const app = new Elysia();

  return app
    .onError(errorHandler)
    .use(openApi)
    .use(pinoLogger())
    .use(cors())
    .use(bearer())

    .get("/api/facts/*", async ({ params, set }) => {
      const key = params["*"];
      if (!key) throw UserError("Key is required!");

      logger.debug("getById(%s)", key);
      return factsDbClient.get({ key }).catch((error) => {
        if (error.message === "Fact not found") {
          set.status = 404;
          return { message: "Fact not found" };
        }
        throw error;
      });
    })
    .put("/api/facts/*", createFact(factsDbClient), {
      type: "json",
      body: t.Object({}, { additionalProperties: true }),
    })
    .post("/api/facts/*", createFact(factsDbClient), {
      type: "json",
      body: t.Object({}, { additionalProperties: true }),
    })
    .delete("/api/facts/*", async ({ set, params: { "*": key } }) => {
      logger.debug("DELETE(%s)", key);
      if (!key) throw UserError("Key is required!");
      const count = await factsDbClient.del({ key });
      logger.debug("DELETE(%s) %j", key, count);
      return new Response(JSON.stringify({ count }), {
        status: count.count > 0 ? 204 : 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .get(
      "/api/query/*",
      async ({ set, params: { "*": keyPrefix } }) => {
        if (!keyPrefix || `${keyPrefix}`.length <= 0) {
          set.status = "Bad Request";
          return { message: "Key is required!" };
        }

        logger.debug("getByPrefix(%s*)", keyPrefix);
        const results = await factsDbClient.find({ keyPrefix });
        return new Response(JSON.stringify(results), {
          status: results.length === 0 ? 204 : 200,
          headers: {
            "Content-Type": "application/json",
            "x-total-count": `${results.length}`,
          },
        });
      },
      {
        // params: t.Object({ '*': t.String() }, { description: "Key" }),
        detail: {
          description: "Get a fact by key",
          tags: ["facts"],
        },
        // response: t.Array(FactResponseTypeDef),
        params: t.Object({ "*": t.String() }, { description: "Key" }),
      },
    );
  // .onResponse(({ request, path, store }) => {
  //   logger.debug(
  //     "%s %s %s %d",
  //     request.method,
  //     path,
  //     request.url,
  //     store.responseTime,
  //   );
  // });
}

const createFact =
  (factsDbClient: FactAdapter) =>
  async ({
    set,
    params: { "*": key },
    body,
  }: {
    set: Record<string, unknown>;
    params: { "*": string };
    body: unknown;
  }) => {
    if (typeof body === "string") body = JSON.parse(body);
    if (typeof body !== "object") throw UserError("Value must be an object!");

    if (!key) throw UserError("Key is required!");
    if (!body) throw UserError("Value is required!");
    set["status"] = 201;
    logger.debug("put(%s, %j)", key, body);
    const results = await factsDbClient.set({ key, value: body });
    logger.debug("put() => %j", key, body, results);
    return new Response(JSON.stringify({ ...body, key: results }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
