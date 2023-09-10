import { Application, IRoute, IRouter, Router } from "express";
import { sortBy } from "lodash";

const defaultOptions = {
  logger: console.info,
};

function getPathFromRegex(regexp: string) {
  return regexp
    .toString()
    .replace("/^", "")
    .replace("?(?=\\/|$)/i", "")
    .replace(/\\\//g, "/")
    .replace("(?:/(?=$))", "");
}

function combineStacks(acc: string[], stack: unknown) {
  // @ts-expect-error
  if (stack.handle.stack) {
    // @ts-expect-error
    const routerPath = getPathFromRegex(stack.regexp);
    return [
      ...acc,
      // @ts-expect-error
      ...stack.handle.stack.map((stack) => ({ routerPath, ...stack })),
    ];
  }
  return [...acc, stack];
}

export function getStacks(app: Application) {
  // Express 3
  if (app.routes) {
    // convert to express 4
    return (
      Object.keys(app.routes)
        // @ts-expect-error
        .reduce((acc, method) => [...acc, ...app.routes[method]], [])
        // @ts-expect-error
        .map((route) => ({ route: { stack: [route] } }))
    );
  }

  // Express 4
  if (app._router && app._router.stack) {
    return app._router.stack.reduce(combineStacks, []);
  }

  // Express 4 Router
  if (app.stack) {
    return app.stack.reduce(combineStacks, []);
  }

  // Express 5
  // @ts-expect-error
  if (app.router && app.router.stack) {
    // @ts-expect-error
    return app.router.stack.reduce(combineStacks, []);
  }

  return [];
}

// @ts-expect-error
export default function extractRoutes(app, opts) {
  const stacks = getStacks(app);
  const options = { ...defaultOptions, ...opts };
  const paths = [];

  if (stacks) {
    for (const stack of stacks) {
      // Exclude middlewares - i.e. require route, and method (below)
      if (stack.route) {
        const routeLogged = {};

        for (const route of stack.route.stack) {
          const method = route.method ? route.method.toUpperCase() : null;
          const handlerName = route.name ? route.name : null;
          const handler = route?.handle;
          // @ts-expect-error
          if (!routeLogged[method] && method) {
            const stackMethod = method;
            const stackPath = [
              options.prefix?.replace(/^\//, ""),
              stack.routerPath?.replace(/^\//, "")?.replace(/\/$/, ""),
              stack.route.path?.replace(/^\//, "").replace(/\/$/, ""),
              route.path?.replace(/^\//, ""),
            ]
              .filter(Boolean)
              .join("/")
              .trim();
            const p = stackPath[0] === "/" ? stackPath : `/${stackPath}`;
            options.logger(stackMethod, p, handlerName);
            paths.push({
              method,
              path: p,
              keys: stack.keys.map(({ name }: { name: string }) => name),
              handlerName,
              handler,
            });
            // @ts-expect-error
            routeLogged[method] = true;
          }
        }
      }
    }
  }

  return sortBy(paths, ["path", "method"]);
}
