import isArray from "lodash/isArray";
import type { Request } from "express";

export const toCsvString = (value: any) =>
  value == null
    ? ""
    : isArray(value)
      ? value?.filter(Boolean)?.join(",")
      : `${value}`.split(",").filter(Boolean).join(",");

export const getKeyFromParamsOrQuery = (request: Request) => {
  let { key } = request.params;
  if (!key && request.query?.["key"])
    key = `${toCsvString(request.query?.["key"])}`;
  return { key };
};
