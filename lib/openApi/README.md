# OpenApi & Express

## Why so ugly?

Most Express integrations for [Open API](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md) (formerly Swagger) suffer from **inconvenient code or type** generation, **awkward un-Express** design, an **often out-of-sync** YAML-first approach, or plain **difficulty sharing** schemas, tags, and 'components.'

Well, no more!

> 💅 Craft a delightful OpenApi & Express integration! 🚀

## Overview

> There are many ways to integrate OpenApi, from code generators, jsdoc annotations, to alternative http frameworks with varying integrations with OpenApi.

### Goals

- 🎯 Build an Express-friendly code-first OpenApi run-time generator.

- Use existing `express` route data!
- Code-first approach. Incrementally add OpenApi along existing code.
- No CLI required & zero code generation!
- There is no new DSL to learn.
- Share & re-use schema logic & typing efforts.

- [ ] Add helpers for frequently needed support, Errors, Pagination, Auth, etc.
- [ ] Include short-hand for common OpenApi patterns. (Assume the 'response' schema defaults to `200`, Auto-catch errors, auto-include 400 & 500 responses, etc.)

## 🚧 WIP: Design Driven Development

### Option 1: Extending Express `Route`

Makes it (easier) to add/remove OpenApi data per existing route.
Can still auto-detect lots of OpenApi data from existing Express internal tracking data.

```ts
router
  .get("/user/:id", (req, res) => res.json(Users.getById(req.params.id)))
  .openApi({
    summary: `Update users by path (and key)`,
    version: "1.0.0",
    params: [{ ":id": "number", }],
    tags: ["admin", "auth:jwt", "auth:cookie"],
    responses: {
      200: { description: "Success", schema: Users.schema },
      400: { description: "Bad Request", schema: Errors.schema },
      401: { description: "Unauthorized", schema: Errors.schema },
    },
  })
  .get("/user/:id/avatar", (req, res) => res.send(Users.getById(req.params.id).avatar))
  .openApi({
    summary: `Get user avatar`,
    version: "1.0.0",
    params: [{ ":id": "number", }],
    responses: {
      'image/*': {
        200: { schema: BinaryData },
        404: { value: `img/not-found.png` },
      },
      'json': {
        200: { schema: URL.schema },
        404: { schema: NotFound.schema },
      },
    })

```

### Option 2: OpenApi -> Handler Last Arg

Less disruptive to any existing code. Wraps `.get`, `.post`, etc router methods to look for a trailing object in any 'middleware' expressions.

```ts
router
  .get(
    "/user/:id",
    (request, response) => response.json(Users.getById(request.params.id)),
    {
      summary: `Update users by path (and key)`,
      version: "1.0.0",
      params: [{ ":id": "number" }],
      tags: ["admin", "auth:jwt", "auth:cookie"],
      responses: {
        200: { description: "Success", schema: Users.schema },
        400: { description: "Bad Request", schema: Errors.schema },
        401: { description: "Unauthorized", schema: Errors.schema },
      },
    },
  );
```

### Option 3: Single OpenApi Helper `addRoute`

This method puts the HTTP verb first and the route/OpenApi data last.

```ts
router
  .addRoute("get", {
    path: "/user/:id",
    handler: (request, response) =>
      response.json(Users.getById(request.params.id)),
    summary: `Update users by path (and key)`,
    tags: ["admin", "auth:jwt", "auth:cookie"],
    responses: {
      200: { description: "Success", schema: Users.schema },
      401: { description: "Unauthorized", schema: Errors.schema },
    },
  })
  .addRoute("get", {
    path: "/user/:id/avatar",
    handler: ({ params }, response) =>
      response.send(Users.getById(params.id).avatar),
    summary: `Get user avatar`,
    responses: {
      "image/*": {
        200: { schema: BinaryData },
        404: { value: `img/not-found.png` },
      },
    },
  });
```

### Option 4: OpenApi Grouped by Path

The structure below largely mirrors OpenApi's configuration; hence, it is less like traditional Express APIs.

```ts
router
  .docRouter("/user/:id", {
    "/": {
      handler: (request, response) =>
        response.json(Users.getById(request.params.id)),
      // Implicit GET:
      summary: `Update users by path (and key)`,
      tags: ["admin"],
      responses: {
        200: { description: "Success", schema: Users.schema },
        400: { description: "Bad Request", schema: Errors.schema },
        401: { description: "Unauthorized", schema: Errors.schema },
      },
    },
    "/avatar": {
      // Explicit GET:
      get: {
        handler: ({ params }, response) =>
          response.send(Users.getById(params.id).avatar),
        summary: `Get user avatar`,
        responses: {
          "image/*": {
            200: { schema: BinaryData },
            404: { value: `img/not-found.png` },
          },
        },
      },
    },
  });
```

## Notes

### "Did you try _X_?"

- Probably, yes.
- It's hard to exaggerate the number of options & approaches I've tried. 😅

- So many libraries
  - `swagger-ui-express`, `swagger-jsdoc`, `deepkit`, `tsoa`, `openapi-express`...
- Non-express frameworks
  - `NestJS`, `Elysia`, `Fastyify`, etc

## Credit

Some projects that did inspire/influence my design:

- [Rails/Rswag](https://github.com/rswag/rswag) - many examples, lots of duplication between routes, specs, models, etc.
- [TSSpec](https://github.com/ts-spec/tspec#express-integration) - slick, minimal, unclear support for schema-level rules.
- [NestJS](https://docs.nestjs.com/openapi/introduction) - springboot fever dream, with angular leanings.
- [Elysia](https://elysiajs.com/patterns/creating-documentation.html) - the web framework included w/ Bun node alternative. Slick API design, but very early stages.
- [Deepkit](https://deepkit.io/framework) - An amazingly comprehensive suite of support documentation, data tooling, code gen, orm, types, schemas, and so much more. Unfortunately much of their examples rely on Classes & decorators, which significantly limits interop and flexibility.
