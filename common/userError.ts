export default class UserError extends Error {
  name = "UserError";
  constructor(message: string, public status: number = 400) {
    super(message);
    this.stack = undefined;
  }
}
