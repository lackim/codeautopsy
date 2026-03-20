import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseRepoArg } from "../src/lib/github.js";

describe("parseRepoArg", () => {
  it("parses owner/repo", () => {
    var result = parseRepoArg("facebook/react");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("parses full https URL", () => {
    var result = parseRepoArg("https://github.com/facebook/react");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("parses URL without protocol", () => {
    var result = parseRepoArg("github.com/facebook/react");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("strips .git suffix", () => {
    var result = parseRepoArg("https://github.com/facebook/react.git");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("strips trailing slash", () => {
    var result = parseRepoArg("facebook/react/");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("returns null for invalid input", () => {
    assert.equal(parseRepoArg("just-a-name"), null);
  });

  it("parses http URL", () => {
    var result = parseRepoArg("http://github.com/atom/atom");
    assert.deepEqual(result, { owner: "atom", repo: "atom" });
  });

  it("rejects command injection in owner", () => {
    assert.equal(parseRepoArg("$(whoami)/repo"), null);
  });

  it("rejects command injection in repo", () => {
    assert.equal(parseRepoArg("owner/$(cat /etc/passwd)"), null);
  });

  it("rejects backtick injection", () => {
    assert.equal(parseRepoArg("`id`/repo"), null);
  });

  it("rejects semicolon injection", () => {
    assert.equal(parseRepoArg("owner;rm -rf/repo"), null);
  });

  it("rejects pipe injection", () => {
    assert.equal(parseRepoArg("owner|curl evil/repo"), null);
  });

  it("allows dots and hyphens in names", () => {
    var result = parseRepoArg("vue-js/vue.js");
    assert.deepEqual(result, { owner: "vue-js", repo: "vue.js" });
  });

  it("rejects names starting with dot or hyphen", () => {
    assert.equal(parseRepoArg(".hidden/repo"), null);
    assert.equal(parseRepoArg("owner/-repo"), null);
  });
});
