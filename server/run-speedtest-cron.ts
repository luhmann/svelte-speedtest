#!/usr/bin/env /home/pi/dev/svelte-speedtest/node_modules/.bin/ts-node-script
// TODO: having absolute path from pi in shebang is not optimal
import { run } from './run-speedtest';

void (async function main() {
  await run();
})();
