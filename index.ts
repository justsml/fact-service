/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import App from "./app";
import { logger } from "./common/logger";
import { dbAdapter } from "./lib/config";

const port = parseInt(process.env.PORT ?? "3000");
const startMessage = `Started server on http://0.0.0.0:${port}`;

const app = App(dbAdapter);

app
  .listen(port)
  .on("error", logger.error.bind(logger))
  .on("listening", () => logger.warn(startMessage));
