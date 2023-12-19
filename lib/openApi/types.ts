// import type { Handler } from "express";
import type { JsonSchema7ObjectType } from "zod-to-json-schema/src/parsers/object";

interface openApiRoute {
  // handler?: Handler,
  summary?: string,
  version?: string,
  tags?: string[],
  params?: Record<string, string>,
  requestSchema?: JsonSchema7ObjectType,
  responses?: JsonSchema7ObjectType,
  "responses": {
    "image/*": {
      200: { schema: BinaryData },
      404: { value: `img/not-found.png` },
    },
  },
}
