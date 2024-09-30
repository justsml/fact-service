/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import { getServer } from "./server";
import { logger } from "../../common/logger";
import { getDataAdapter } from "../../lib/providers";

const port = parseInt(process.env["PORT"] ?? "3000");
const startMessage = `Started server on http://0.0.0.0:${port}`;

const adapter = getDataAdapter();
logger.warn(`Starting ELYSIA server + ${adapter._name} adapter on :${port}`);
const server = getServer(adapter);

server
  .onError(({error, set}) => {
    if ('code' in error) {
      set.status = Number(error.code);
    } else {
      set.status = 500;
    }
    return { error: error.message };

  })
  .listen(port)
  // .on("error", logger.error.bind(logger))
  .on("start", () => logger.warn(startMessage));

process.on("uncaughtException", logger.fatal.bind(logger));
process.on("unhandledRejection", logger.error.bind(logger));
