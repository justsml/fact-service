/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import App from "./app";
import { logger } from "./common/logger";

const port = parseInt(process.env.PORT ?? "3000");
const startMessage = `Started server on http://0.0.0.0:${port}`;

const app = App();

app
  .listen(port)
  .on("error", logger.error.bind(logger))
  .on("listening", () => logger.info(startMessage));
