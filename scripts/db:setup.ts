#!/usr/bin/env yarn ts-node

import { testAdapters } from "../lib/config";
import { getSetup } from "../lib/providers";

(async () => {
  const results = Promise.all(testAdapters.map(async (adapter) => {
    const setupFn = getSetup(adapter)
    const result = await setupFn();
    return [adapter, result];
  }));
  console.log(await results);
})();
