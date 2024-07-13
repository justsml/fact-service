#!/usr/bin/env yarn ts-node

import { testAdapters } from "../lib/config";
// import type { FactAdapter } from "../lib/factService/types";
import { getSetup } from "../lib/providers";

(async () => {
  const results = Promise.allSettled(
    testAdapters.map(async (adapter: string) => {
      const setupFn = getSetup(adapter);
      const result = await setupFn();
      return [adapter, result];
    }),
  );
  console.log(await results);
  console.log("Done");
  setTimeout(() => process.exit(0), 1000);
})();
