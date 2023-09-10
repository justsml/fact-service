/* credit: https://github.com/justsml/guides/tree/master/express/setup-guide */
import extractRoutes from "../lib/extractRoutes";
import App from "./app";

const port = parseInt(process.env.PORT ?? "3000");
const startMessage = `Started server on http://0.0.0.0:${port}`;

export const app = App();

app.listen(port)
  .on("error", console.error)
  .on("listening", () => console.log(startMessage));


const routeData = extractRoutes(app, {});

console.log("Routes:", routeData);