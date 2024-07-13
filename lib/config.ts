import { easyConfig } from "@elite-libs/auto-config";
import { escapeRegExp } from "lodash";

const config = easyConfig({
  env: ["FACTS_ENV", "NODE_ENV"],
  port: ["--port", "-p", "PORT"],
  allowedTokens: ["--allowedTokens", "ALLOWED_TOKENS"],
  databaseUrl: ["--db", "DATABASE_URL", "DATABASE_URI"],
  pathSeparator: ["--pathSeparator", "PATH_SEPARATOR"],
  pathSplitPattern: ["--pathSplitPattern", "PATH_SPLIT_PATTERN"],
});

// export default config;

export const allowedTokens = _parseTokenList(config.allowedTokens);
// override the config.allowedTokens?
// config.allowedTokens = allowedTokens;

export const env = config.env;
export const port = Number(config.port);
export const databaseUrl = config.databaseUrl;

export const pathSeparator = config.pathSeparator ?? ".";
export const pathSplitPattern =
  `${config.pathSplitPattern}`.length >= 2
    ? new RegExp(escapeRegExp(config.pathSplitPattern), "mig")
    : /\./gim;

if (allowedTokens.length <= 0)
  throw new Error(`ALLOWED_TOKENS is empty. Check config or .env file.`);

/**
 * Splits tokens set in env.ALLOWED_TOKENS (space delimited)
 */
function _parseTokenList(tokenList: string | string[] | undefined): string[] {
  if (tokenList == null) return [];
  if (Array.isArray(tokenList)) return tokenList;
  return tokenList.split(/\s+/);
}
