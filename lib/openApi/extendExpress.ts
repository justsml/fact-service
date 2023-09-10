// import { OpenApiOptions } from "../types/express";

declare module "express-serve-static-core" {
  export interface Application {
    _openApiList: OpenApiOptions[];
    _openApiComponents: Record<string, unknown>;
  }
  export interface Router {
    _openApiList: OpenApiOptions[];
    _openApiComponents: Record<string, unknown>;
    openApi: (opts: OpenApiOptions) => this;
    printStackInfo: () => this;
  }
}
declare global {
  namespace Express {
    interface Router {
      _openApiList: OpenApiOptions[];
      openApi: (opts: OpenApiOptions) => this;
      printStackInfo: () => this;
    }
    interface Application {
      _openApiList: OpenApiOptions[];
      _openApiComponents: Record<string, unknown>;
      _openApiGlobals: OpenApiGlobals;
    }
  }
}

export type OpenApiGlobals = {
  title?: string;
  version?: string;
  description?: string;
  termsOfService?: string;
  // servers?: { url: string }[];
  externalDocs?: { url: string; description?: string };
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

export type OpenApiOptions<
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
  requestCheck?: TResponsePayload;
  responseCheck?: TRequestBody;
  requestPayload?: TRequestBody extends { schema: unknown }
    ? TRequestBody["schema"]
    : TRequestBody extends (...args: any[]) => infer R
    ? R
    : unknown;
  responseBody?: TRequestBody extends { schema: unknown }
    ? TRequestBody["schema"]
    : TRequestBody extends (...args: any[]) => infer R
    ? R
    : unknown;
  // components?: Record<string, unknown>;
};
