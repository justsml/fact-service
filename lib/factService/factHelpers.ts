import isArray from "lodash/isArray";
import type { Request } from "express";

export const toCsvString = (value: any) =>
  value == null
    ? ""
    : isArray(value)
    ? value?.filter(Boolean)?.join(",")
    : `${value}`.split(",").filter(Boolean).join(",");

export const extractPathAndKeys = (request: Request) => {
  let { path, key } = request.params;
  if (!path && request.query.path) path = `${request.query.path}`;
  if (!key && request.query?.key) key = `${toCsvString(request.query?.key)}`;
  return { path, key };
};
