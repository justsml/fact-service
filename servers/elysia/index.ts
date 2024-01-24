
/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import {getServer} from "./server";
import { logger } from "../../common/logger";
import { dbAdapter } from "../../lib/config";
import { getDataAdapter } from "../../lib/providers";

const port = parseInt(process.env['PORT'] ?? "3000");
const startMessage = `Started server on http://0.0.0.0:${port}`;

const adapter = getDataAdapter('postgres');
const server = getServer(adapter);

server
  .listen(port)
  .on("error", logger.error.bind(logger))
  .on("start", () => logger.warn(startMessage));

process.on("uncaughtException", logger.fatal.bind(logger));
process.on("unhandledRejection", logger.error.bind(logger));
