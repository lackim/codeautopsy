import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const env = { ...process.env, SHIPCLI_DISABLE_UPDATE_CHECK: "1" };

describe("codeautopsy CLI", () => {
  it("shows help through the shipcli command wrapper", () => {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "src/cli.ts", "--help"],
      { cwd: projectRoot, encoding: "utf-8", env },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Usage: codeautopsy \[options\] \[target\]/);
    assert.match(result.stdout, /--json\s+Output as JSON/);
    assert.match(result.stdout, /--share\s+Generate shareable output/);
  });

  it("rejects an invalid repository before calling GitHub", () => {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "src/cli.ts", "invalid"],
      { cwd: projectRoot, encoding: "utf-8", env },
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid repository format/);
  });
});
