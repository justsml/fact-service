/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import App from "./app";
import { logger } from "../../common/logger";
import { config, dbAdapter } from "../../lib/config";

logger.info(`Starting server with ${dbAdapter} adapter`);

const port = config.port;
const startMessage = `Started server on http://0.0.0.0:${port}`;

const app = App(dbAdapter);

app
  .listen(port)
  .on("error", logger.error.bind(logger))
  .on("listening", () => logger.warn(startMessage));

process.on("uncaughtException", logger.fatal.bind(logger));
process.on("unhandledRejection", logger.error.bind(logger));
