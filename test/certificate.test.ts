import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderCertificate } from "../src/lib/certificate.js";
import type { AnalysisReport } from "../src/lib/analyze.js";

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g;

function makeReport(signal: string): AnalysisReport {
  return {
    name: "repo",
    fullName: "owner/repo",
    description: "A repository",
    language: "TypeScript",
    stars: 0,
    forks: 0,
    createdAt: "2025-01-01T00:00:00.000Z",
    lastCommit: "2025-12-01T00:00:00.000Z",
    lastPush: "2025-12-01T00:00:00.000Z",
    lastRelease: null,
    ageInDays: 334,
    daysSinceLastCommit: 10,
    daysSinceLastPush: 10,
    daysSinceLastRelease: null,
    totalContributors: 1,
    topContributorPct: 100,
    busFactorOne: true,
    openIssuesCount: 0,
    unansweredIssues: 0,
    activityDecline: 58,
    score: 65,
    status: "declining",
    causeOfDeath: "Gradual abandonment",
    signals: [{ signal, severity: "warning" }],
    commitsByMonth: {},
    archived: false,
  };
}

describe("renderCertificate", () => {
  it("wraps long death signals inside the certificate border", () => {
    const output = renderCertificate(
      makeReport("Bus factor 1: top contributor has 100% of commits"),
    );
    const certificateLines = output
      .split("\n")
      .map((line) => line.replace(ANSI_RE, ""))
      .filter((line) => line.includes("║"));

    assert.ok(certificateLines.length > 0);
    for (const line of certificateLines) {
      assert.equal(line.length, 54, `Misaligned certificate row: ${line}`);
    }
    assert.match(output.replace(ANSI_RE, ""), /\n  ║    commits\s+║/);
  });
});
