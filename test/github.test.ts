import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  fetchRepoData,
  parseRepoArg,
  type GitHubClient,
  type RepositoryInfo,
} from "../src/lib/github.js";

describe("parseRepoArg", () => {
  it("parses owner/repo", () => {
    const result = parseRepoArg("facebook/react");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("parses full https URL", () => {
    const result = parseRepoArg("https://github.com/facebook/react");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("parses URL without protocol", () => {
    const result = parseRepoArg("github.com/facebook/react");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("strips .git suffix", () => {
    const result = parseRepoArg("https://github.com/facebook/react.git");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("strips trailing slash", () => {
    const result = parseRepoArg("facebook/react/");
    assert.deepEqual(result, { owner: "facebook", repo: "react" });
  });

  it("returns null for invalid input", () => {
    assert.equal(parseRepoArg("just-a-name"), null);
  });

  it("parses http URL", () => {
    const result = parseRepoArg("http://github.com/atom/atom");
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
    const result = parseRepoArg("vue-js/vue.js");
    assert.deepEqual(result, { owner: "vue-js", repo: "vue.js" });
  });

  it("rejects names starting with dot or hyphen", () => {
    assert.equal(parseRepoArg(".hidden/repo"), null);
    assert.equal(parseRepoArg("owner/-repo"), null);
  });
});

describe("fetchRepoData", () => {
  it("fetches independent collections concurrently and caps pagination", async () => {
    const calls: string[] = [];
    let activeRequests = 0;
    let maxActiveRequests = 0;
    const now = new Date().toISOString();
    const repo: RepositoryInfo = {
      owner: { login: "example" },
      name: "project",
      full_name: "example/project",
      description: "Example",
      language: "TypeScript",
      stargazers_count: 1,
      forks_count: 0,
      created_at: now,
      pushed_at: now,
      archived: false,
    };

    const client: GitHubClient = {
      async get<T>(endpoint: string): Promise<T | null> {
        calls.push(endpoint);
        activeRequests += 1;
        maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
        await new Promise((resolve) => setTimeout(resolve, 1));

        let value: unknown;
        if (endpoint === "repos/example/project") value = repo;
        else if (endpoint.endsWith("stats/participation")) value = { all: new Array(52).fill(1) };
        else if (endpoint.includes("/commits?")) {
          value = Array.from({ length: 100 }, () => ({ commit: { author: { date: now } } }));
        } else value = [];

        activeRequests -= 1;
        return value as T;
      },
    };

    const data = await fetchRepoData("example", "project", client);

    assert.ok(data);
    assert.equal(data.commits.length, 500);
    assert.ok(calls.some((endpoint) => endpoint.includes("/commits?per_page=100&page=5")));
    assert.ok(!calls.some((endpoint) => endpoint.includes("page=6")));
    assert.ok(calls.some((endpoint) => endpoint.includes("/issues?state=open&per_page=100&page=1")));
    assert.ok(maxActiveRequests >= 5, `Expected parallel requests, observed ${maxActiveRequests}`);
  });
});
