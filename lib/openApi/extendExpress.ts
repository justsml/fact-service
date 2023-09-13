// import { OpenApiOptions } from "../types/express";

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
type OpenApiRouteResponses = OpenApiSchemaReference | {
  [key: number]: OpenApiSchemaReference;
};