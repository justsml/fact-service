export class NotFoundError extends Error {
  status: number = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UserError extends Error {
  status: number = 400;
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export class ServerError extends Error {
  status: number = 400;
  constructor(message: string) {
    super(message);
    this.name = "ServerError";
  }
}
