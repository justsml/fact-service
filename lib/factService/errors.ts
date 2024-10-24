export class NotFoundError extends Error {
  status: number = 404;
  key?: string = undefined;

  constructor(message: string, key?: string) {
    super(message);
    this.name = "NotFoundError";
    this.key = key;
  }
  getResponse() {
    return new Response(
      JSON.stringify({
        message: this.message,
        key: this.key ?? undefined,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
        statusText: "Resource Not Found",
      },
    );
  }
}

class _UserError extends Error {
  name = "UserError";
  code = "USER_ERROR";
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
  getResponse() {
    return new Response(JSON.stringify({ message: this.message }), {
      headers: { "Content-Type": "application/json" },
      statusText: "Bad Request",
      status: this.status ?? 400,
    });
  }
}

export function UserError(this: unknown, message: string) {
  if (!(this instanceof UserError)) return new _UserError(message);
  return new _UserError(message);
}

export class ServerError extends Error {
  status: number = 500;
  constructor(message: string) {
    super(message);
    this.name = "ServerError";
  }
  getResponse() {
    return new Response(JSON.stringify({ message: this.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
      statusText: "Server Error",
    });
  }
}
