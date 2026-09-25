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
    lifespanInDays: 334,
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

  it("uses health-report wording while a repository is still alive", () => {
    const report = makeReport("Bus factor 1");
    report.status = "alive";
    report.causeOfDeath = "Still breathing";
    report.score = 90;

    const output = renderCertificate(report).replace(ANSI_RE, "");
    assert.match(output, /REPOSITORY HEALTH REPORT/);
    assert.match(output, /Last Commit:/);
    assert.match(output, /Condition: Still breathing/);
    assert.doesNotMatch(output, /Died:/);
  });

  it("uses death-certificate wording for archived repositories", () => {
    const report = makeReport("Repository is archived");
    report.status = "dead";
    report.causeOfDeath = "Archived by owner";
    report.score = 20;
    report.archived = true;

    const output = renderCertificate(report).replace(ANSI_RE, "");
    assert.match(output, /DEATH CERTIFICATE/);
    assert.match(output, /Died:/);
    assert.match(output, /Lifespan:/);
    assert.match(output, /Cause: Archived by owner/);
  });

  it("strips terminal control sequences from repository metadata", () => {
    const report = makeReport("Unexpected\n\x1b]52;c;copied\x07activity");
    report.fullName = "owner/\x1b[31mrepo";
    report.language = "TypeScript\rspoofed";
    report.description = "Legitimate\n\x1b]2;fake title\x07description";

    const output = renderCertificate(report).replace(ANSI_RE, "");

    // eslint-disable-next-line no-control-regex
    assert.doesNotMatch(output, /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/);
    assert.match(output, /owner\/ \[31mrepo/);
    assert.match(output, /TypeScript spoofed/);
    assert.match(output, /Legitimate \]2;fake title description/);
  });
});
