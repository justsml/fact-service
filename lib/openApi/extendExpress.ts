// import { OpenApiOptions } from "../types/express";

import { IRouterHandler, NextFunction } from "express";
import type * as core from "express-serve-static-core";

interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

declare module "express-serve-static-core" {
  export interface Application {
    _openApiList: OpenApiRouteOptions[];
    _openApiComponents: Record<string, unknown>;
  }
  export interface Router {
    _openApiList: OpenApiRouteOptions[];
    _openApiComponents: Record<string, unknown>;
    openApi: (opts: OpenApiRouteOptions) => this;
    printStackInfo: () => this;
  }
}
declare global {
  namespace Express {
    interface Router {
      _openApiList: OpenApiRouteOptions[];
      openApi: (opts: OpenApiRouteOptions) => this;
      printStackInfo: () => this;
    }
    //   interface IRoute<Route extends string = string> {
    //     path: string;
    //     stack: any;
    //     all: IRouter['all'];
    //     get: IRouterHandler<this, Route>;
    //     post: IRouterHandler<this, Route>;
    //     put: IRouterHandler<this, Route>;
    //     delete: IRouterHandler<this, Route>;
    //     patch: IRouterHandler<this, Route>;
    //     options: IRouterHandler<this, Route>;
    //     head: IRouterHandler<this, Route>;

    //     checkout: IRouterHandler<this, Route>;
    //     copy: IRouterHandler<this, Route>;
    //     lock: IRouterHandler<this, Route>;
    //     merge: IRouterHandler<this, Route>;
    //     mkactivity: IRouterHandler<this, Route>;
    //     mkcol: IRouterHandler<this, Route>;
    //     move: IRouterHandler<this, Route>;
    //     'm-search': IRouterHandler<this, Route>;
    //     notify: IRouterHandler<this, Route>;
    //     purge: IRouterHandler<this, Route>;
    //     report: IRouterHandler<this, Route>;
    //     search: IRouterHandler<this, Route>;
    //     subscribe: IRouterHandler<this, Route>;
    //     trace: IRouterHandler<this, Route>;
    //     unlock: IRouterHandler<this, Route>;
    //     unsubscribe: IRouterHandler<this, Route>;
    // }

    interface RequestHandler<
      P = core.ParamsDictionary,
      ResBody = any,
      ReqBody = any,
      ReqQuery = ParsedQs,
      Locals extends Record<string, any> = Record<string, any>,
    > {
      // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2)
      (
        req: core.Request<P, ResBody, ReqBody, ReqQuery, Locals>,
        res: core.Response<ResBody, Locals>,
        next: NextFunction,
      ): void;
    }

    export type ErrorRequestHandler<
      P = core.ParamsDictionary,
      ResBody = any,
      ReqBody = any,
      ReqQuery = ParsedQs,
      Locals extends Record<string, any> = Record<string, any>,
    > = (
      err: any,
      req: core.Request<P, ResBody, ReqBody, ReqQuery, Locals>,
      res: core.Response<ResBody, Locals>,
      next: NextFunction,
    ) => void;

    export type PathParams = string | RegExp | Array<string | RegExp>;

    export type RequestHandlerParams<
      P = core.ParamsDictionary,
      ResBody = any,
      ReqBody = any,
      ReqQuery = ParsedQs,
      Locals extends Record<string, any> = Record<string, any>,
    > =
      | RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
      | ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
      | Array<RequestHandler<P> | ErrorRequestHandler<P>>;

    type RemoveTail<
      S extends string,
      Tail extends string,
    > = S extends `${infer P}${Tail}` ? P : S;
    type GetRouteParameter<S extends string> = RemoveTail<
      RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
      `.${string}`
    >;

    // prettier-ignore
    export type RouteParameters<Route extends string> = string extends Route
      ? core.ParamsDictionary
      : Route extends `${string}(${string}`
          ? core.ParamsDictionary //TODO: handling for regex parameters
          : Route extends `${string}:${infer Rest}`
              ? (
              GetRouteParameter<Rest> extends never
                  ? core.ParamsDictionary
                  : GetRouteParameter<Rest> extends `${infer ParamName}?`
                      ? { [P in ParamName]?: string }
                      : { [P in GetRouteParameter<Rest>]: string }
              ) &
              (Rest extends `${GetRouteParameter<Rest>}${infer Next}`
                  ? RouteParameters<Next> : unknown)
              : {};

    export interface IRouterMatcher<
      T,
      Method extends
        | "all"
        | "get"
        | "post"
        | "put"
        | "delete"
        | "patch"
        | "options"
        | "head" = any,
    > {
      <
        Route extends string,
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        // tslint:disable-next-line no-unnecessary-generics (it's used as the default type parameter for P)
        path: Route,
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      <
        Path extends string,
        P = RouteParameters<Path>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        // tslint:disable-next-line no-unnecessary-generics (it's used as the default type parameter for P)
        path: Path,
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      <
        P = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        path: PathParams,
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      <
        P = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        path: PathParams,
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      (path: PathParams, subApplication: Application): T;
    }

    export interface IRouterHandler<T, Route extends string = string> {
      (...handlers: Array<RequestHandler<RouteParameters<Route>>>): T;
      (...handlers: Array<RequestHandlerParams<RouteParameters<Route>>>): T;
      <
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      <
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      <
        P = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
      <
        P = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>,
      >(
        // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
        ...handlers: Array<
          RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>
        >
      ): T;
    }

    export interface IRouter extends RequestHandler {
      /**
       * Map the given param placeholder `name`(s) to the given callback(s).
       *
       * Parameter mapping is used to provide pre-conditions to routes
       * which use normalized placeholders. For example a _:user_id_ parameter
       * could automatically load a user's information from the database without
       * any additional code,
       *
       * The callback uses the samesignature as middleware, the only differencing
       * being that the value of the placeholder is passed, in this case the _id_
       * of the user. Once the `next()` function is invoked, just like middleware
       * it will continue on to execute the route, or subsequent parameter functions.
       *
       *      app.param('user_id', function(req, res, next, id){
       *        User.find(id, function(err, user){
       *          if (err) {
       *            next(err);
       *          } else if (user) {
       *            req.user = user;
       *            next();
       *          } else {
       *            next(new Error('failed to load user'));
       *          }
       *        });
       *      });
       */
      param(name: string, handler: core.RequestParamHandler): this;

      /**
       * Alternatively, you can pass only a callback, in which case you have the opportunity to alter the app.param()
       *
       * @deprecated since version 4.11
       */
      param(
        callback: (name: string, matcher: RegExp) => core.RequestParamHandler,
      ): this;

      /**
       * Special-cased "all" method, applying the given route `path`,
       * middleware, and callback to _every_ HTTP method.
       */
      all: IRouterMatcher<this, "all">;
      get: IRouterMatcher<this, "get">;
      post: IRouterMatcher<this, "post">;
      put: IRouterMatcher<this, "put">;
      delete: IRouterMatcher<this, "delete">;
      patch: IRouterMatcher<this, "patch">;
      options: IRouterMatcher<this, "options">;
      head: IRouterMatcher<this, "head">;

      checkout: IRouterMatcher<this>;
      connect: IRouterMatcher<this>;
      copy: IRouterMatcher<this>;
      lock: IRouterMatcher<this>;
      merge: IRouterMatcher<this>;
      mkactivity: IRouterMatcher<this>;
      mkcol: IRouterMatcher<this>;
      move: IRouterMatcher<this>;
      "m-search": IRouterMatcher<this>;
      notify: IRouterMatcher<this>;
      propfind: IRouterMatcher<this>;
      proppatch: IRouterMatcher<this>;
      purge: IRouterMatcher<this>;
      report: IRouterMatcher<this>;
      search: IRouterMatcher<this>;
      subscribe: IRouterMatcher<this>;
      trace: IRouterMatcher<this>;
      unlock: IRouterMatcher<this>;
      unsubscribe: IRouterMatcher<this>;

      use: IRouterHandler<this> & IRouterMatcher<this>;

      route<T extends string>(prefix: T): IRoute<T>;
      route(prefix: PathParams): IRoute;
      /**
       * Stack of configured routes
       */
      stack: any[];
    }

    export interface IRoute<Route extends string = string> {
      path: string;
      stack: any;
      all: IRouterHandler<this, Route>;
      get: IRouterHandler<this, Route>;
      post: IRouterHandler<this, Route>;
      put: IRouterHandler<this, Route>;
      delete: IRouterHandler<this, Route>;
      patch: IRouterHandler<this, Route>;
      options: IRouterHandler<this, Route>;
      head: IRouterHandler<this, Route>;

      checkout: IRouterHandler<this, Route>;
      copy: IRouterHandler<this, Route>;
      lock: IRouterHandler<this, Route>;
      merge: IRouterHandler<this, Route>;
      mkactivity: IRouterHandler<this, Route>;
      mkcol: IRouterHandler<this, Route>;
      move: IRouterHandler<this, Route>;
      "m-search": IRouterHandler<this, Route>;
      notify: IRouterHandler<this, Route>;
      purge: IRouterHandler<this, Route>;
      report: IRouterHandler<this, Route>;
      search: IRouterHandler<this, Route>;
      subscribe: IRouterHandler<this, Route>;
      trace: IRouterHandler<this, Route>;
      unlock: IRouterHandler<this, Route>;
      unsubscribe: IRouterHandler<this, Route>;
    }

    export interface Router extends IRouter {}

    //   interface IRouterHandler<T, Route extends string = string> {
    //     (...handlers: Array<RequestHandler<core.RouteParameters<Route>>>): T;
    //     (...handlers: Array<RequestHandlerParams<core.RouteParameters<Route>>>): T;
    //     <
    //         P = core.RouteParameters<Route>,
    //         ResBody = any,
    //         ReqBody = any,
    //         ReqQuery = ParsedQs,
    //         Locals extends Record<string, any> = Record<string, any>
    //         >(
    //         // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
    //         ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
    //     ): T;
    //     <
    //         P = RouteParameters<Route>,
    //         ResBody = any,
    //         ReqBody = any,
    //         ReqQuery = ParsedQs,
    //         Locals extends Record<string, any> = Record<string, any>
    //         >(
    //         // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
    //         ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>>
    //     ): T;
    //     <
    //         P = core.ParamsDictionary,
    //         ResBody = any,
    //         ReqBody = any,
    //         ReqQuery = ParsedQs,
    //         Locals extends Record<string, any> = Record<string, any>
    //     >(
    //         // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
    //         ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
    //     ): T;
    //     <
    //         P = core.ParamsDictionary,
    //         ResBody = any,
    //         ReqBody = any,
    //         ReqQuery = ParsedQs,
    //         Locals extends Record<string, any> = Record<string, any>
    //     >(
    //         // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
    //         ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>>
    //     ): T;
    // }

    interface Application {
      _openApiList: OpenApiRouteOptions[];
      _openApiComponents: Record<string, unknown>;
      _openApiGlobals: OpenApiGlobals;
    }
  }
}

/**
 * The `OpenApiGlobals` interface defines top-level OpenApi properties.
 *
 * Including re-usable 'components' and 'tags' objects.
 */
export type OpenApiGlobals = {
  title?: string;
  version?: string;
  description?: string;
  termsOfService?: string;
  servers?: { url: string }[];
  externalDocs?: { url: string; description?: string };
  /** Declare label & description pairs, refer by name in the OpenApiRouteOptions */
  tags?: Record<string, string>;
  security?: { [key: string]: string[] };
  license?: { name: string; url: string };
  components?: Record<string, unknown>;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
    website?: string;
  };
};

export type SchemaWithExamples =
  | ((body: any) => unknown)
  | {
      examples?: unknown[];
      schema?: unknown;
    };

export type OpenApiRouteOptions<
  TRequestBody extends SchemaWithExamples = (body: any) => unknown,
  TResponsePayload extends SchemaWithExamples = (body: any) => unknown,
> = {
  title?: string;
  version?: string;
  summary?: string;
  // servers?: { url: string; description: string }[];
  tags?: string[];
  security?: { [key: string]: string[] };

  license?: { name: string; url: string };
  // requestCheck?: TResponsePayload;
  // responseCheck?: TRequestBody;
  // requestPayload?: TRequestBody extends { schema: unknown }
  //   ? TRequestBody["schema"]
  //   : TRequestBody extends (...args: any[]) => infer R
  //   ? R
  //   : unknown;
  // responseBody?: TRequestBody extends { schema: unknown }
  //   ? TRequestBody["schema"]
  //   : TRequestBody extends (...args: any[]) => infer R
  //   ? R
  //   : unknown;
  // components?: Record<string, unknown>;
};

type OpenApiSchemaReference = {
  $ref: string;
};
/**
 * Note: simplifications made include:
 *
 * - Response types may be defined in a status-code map.
 *  - However it's assumed 200 is the default response when one schema set on `responses`.
 *
 */
type OpenApiRouteResponses =
  | OpenApiSchemaReference
  | {
      [key: number]: OpenApiSchemaReference;
    };
