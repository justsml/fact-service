import express, { Express, Application, Router } from "express";
import extractRoutes, { getStacks } from "../extractRoutes";
import type { OpenApiGlobals, OpenApiRouteOptions } from "./extendExpress";

/**
 * Replace the default express app with this method to add OpenApi support.
 */
export function expressOpenApi(this: undefined | void | Application, openApiGlobals: OpenApiGlobals = {}) {
  const contextualApp = this && 'get' in this ? this : undefined;
  const app = contextualApp || express();
  
  const testRouter = express.Router();
  const appProto = Object.getPrototypeOf(app);
  const routerProto = Object.getPrototypeOf(testRouter);
  app._openApiGlobals = app._openApiGlobals || openApiGlobals;
  appProto.openApi = appProto.openApi || expressOpenApi;
  routerProto.openApi = routerProto.openApi || openApi;
  // app.route.prototype.openApi = app.route.prototype.openApi || openApi;
  // app.prototype.openApi = app.prototype.openApi || openApi;
  Router.prototype.openApi = Router.prototype.openApi || openApi;
  Router.prototype.printStackInfo =
    Router.prototype.printStackInfo || printStackInfo;
  // CoreRouter.prototype.openApi = CoreRouter.prototype.openApi || openApi;
  return app;

}

export function openApiRouter() {
  const router = express.Router();
  router._openApiList = router._openApiList || [];
  // router._openApiList.push(opts);
  router.openApi = router.openApi || openApi;
  // console.log("OpenApi:", opts);
  return router;
}

const openApi = function openApi(this: Router, opts: OpenApiRouteOptions) {
  this._openApiList = this._openApiList || [];
  const stack = getStacks(this as unknown as Application);
  const routes = extractRoutes(this as unknown as Application, {
    skipSort: true,
  });

  console.info("Routes:", routes.length, routes[routes.length - 1]);
  // console.log('Stack len', stack.length, stack[stack.length - 1]);
  this._openApiList.push(opts);
  console.log("OpenApi:", opts);
  return this;
};

const printStackInfo = function printStackInfo(this: Router) {
  const stacks = getStacks(this as unknown as Application);
  console.log("Stacks:", stacks);
  return this;
};