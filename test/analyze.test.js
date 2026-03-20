import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/lib/analyze.js";

function makeRepo(overrides = {}) {
  var now = new Date();
  return {
    repo: {
      owner: { login: "test" },
      name: "repo",
      full_name: "test/repo",
      description: "A test repo",
      language: "JavaScript",
      stargazers_count: 100,
      forks_count: 20,
      created_at: new Date(now - 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
      pushed_at: now.toISOString(),
      archived: false,
      ...overrides.repo,
    },
    commits: overrides.commits || [
      { commit: { author: { date: now.toISOString() } } },
    ],
    issues: overrides.issues || [],
    contributors: overrides.contributors || [
      { login: "alice", contributions: 50 },
      { login: "bob", contributions: 50 },
    ],
    releases: overrides.releases || [],
    participation: overrides.participation || { all: new Array(52).fill(5) },
  };
}

describe("analyze", () => {
  it("healthy repo scores 80+", () => {
    var data = makeRepo();
    var report = analyze(data);
    assert.ok(report.score >= 80, `Expected score >= 80, got ${report.score}`);
    assert.equal(report.status, "alive");
  });

  it("archived repo is critical", () => {
    var data = makeRepo({ repo: { archived: true } });
    var report = analyze(data);
    assert.ok(report.signals.some((s) => s.signal === "Repository is archived"));
    assert.ok(report.score < 80);
    assert.equal(report.causeOfDeath, "Archived by owner");
  });

  it("no commits in over a year = critical", () => {
    var old = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    var data = makeRepo({
      commits: [{ commit: { author: { date: old } } }],
      repo: { pushed_at: old },
    });
    var report = analyze(data);
    assert.ok(report.signals.some((s) => s.signal.includes("No commits in over a year")));
    assert.ok(report.daysSinceLastCommit > 365);
  });

  it("no commits in 6+ months = warning", () => {
    var sixMonths = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
    var data = makeRepo({
      commits: [{ commit: { author: { date: sixMonths } } }],
      repo: { pushed_at: sixMonths },
    });
    var report = analyze(data);
    assert.ok(report.signals.some((s) => s.signal.includes("No commits in 6+ months")));
  });

  it("bus factor 1 detected", () => {
    var data = makeRepo({
      contributors: [
        { login: "alice", contributions: 95 },
        { login: "bob", contributions: 5 },
      ],
    });
    var report = analyze(data);
    assert.ok(report.busFactorOne);
    assert.ok(report.signals.some((s) => s.signal.includes("Bus factor 1")));
  });

  it("many unanswered issues = warning/critical", () => {
    var issues = Array.from({ length: 25 }, (_, i) => ({
      state: "open",
      comments: 0,
      created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    var data = makeRepo({ issues });
    var report = analyze(data);
    assert.ok(report.signals.some((s) => s.signal.includes("unanswered issues")));
    assert.ok(report.unansweredIssues === 25);
  });

  it("dead repo scores 0-24", () => {
    var twoYearsAgo = new Date(Date.now() - 800 * 24 * 60 * 60 * 1000).toISOString();
    var data = makeRepo({
      repo: { archived: true, pushed_at: twoYearsAgo },
      commits: [{ commit: { author: { date: twoYearsAgo } } }],
      participation: { all: [...new Array(40).fill(5), ...new Array(12).fill(0)] },
      issues: Array.from({ length: 30 }, () => ({
        state: "open",
        comments: 0,
        created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    });
    var report = analyze(data);
    assert.ok(report.score <= 24, `Expected score <= 24, got ${report.score}`);
    assert.equal(report.status, "dead");
  });

  it("report contains expected fields", () => {
    var data = makeRepo();
    var report = analyze(data);
    assert.ok("name" in report);
    assert.ok("score" in report);
    assert.ok("status" in report);
    assert.ok("causeOfDeath" in report);
    assert.ok("signals" in report);
    assert.ok("stars" in report);
    assert.ok("forks" in report);
    assert.ok("daysSinceLastCommit" in report);
    assert.ok("commitsByMonth" in report);
  });

  it("still breathing when no signals", () => {
    var data = makeRepo();
    var report = analyze(data);
    if (report.signals.length === 0) {
      assert.equal(report.causeOfDeath, "Still breathing");
    }
  });
});
