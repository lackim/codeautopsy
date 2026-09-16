import { chmodSync } from "node:fs";
import { resolve } from "node:path";

chmodSync(resolve("dist/cli.js"), 0o755);
