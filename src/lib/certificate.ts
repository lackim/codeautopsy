import { fmt } from "@shipcli/core/output";
import kleur from "kleur";
import type { AnalysisReport, HealthStatus } from "./analyze.js";

const WIDTH = 50;
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g;

function visLen(str: string): number {
  return str.replace(ANSI_RE, "").length;
}

function pad(text: string): string {
  var need = WIDTH - visLen(text);
  return text + (need > 0 ? " ".repeat(need) : "");
}

function row(text: string): string {
  return kleur.dim("  ║") + pad(text) + kleur.dim("║");
}

export function renderCertificate(report: AnalysisReport): string {
  const lines: string[] = [];
  const border = "═".repeat(WIDTH);

  lines.push("");
  lines.push(kleur.dim(`  ╔${border}╗`));
  lines.push(row(kleur.bold("         DEATH CERTIFICATE           ")));
  lines.push(kleur.dim(`  ╠${border}╣`));
  lines.push(row(`  Name:      ${fmt.bold(report.fullName)}`));
  lines.push(row(`  Born:      ${formatDate(report.createdAt)}`));
  lines.push(row(`  Died:      ${formatDate(report.lastCommit)}`));
  lines.push(row(`  Age:       ${formatAge(report.ageInDays)}`));
  lines.push(row(`  Language:  ${report.language || "Unknown"}`));
  lines.push(row(""));
  lines.push(row(`  Cause:     ${kleur.red(report.causeOfDeath)}`));
  lines.push(row(`  Status:    ${statusBadge(report.status)}`));
  lines.push(row(`  Score:     ${scoreBadge(report.score)}/100`));
  lines.push(row(""));
  lines.push(kleur.dim(`  ╠${border}╣`));
  lines.push(row(kleur.bold("  Vital Signs")));
  lines.push(row(""));
  lines.push(row(`  Stars:          ${fmt.val(report.stars)}`));
  lines.push(row(`  Forks:          ${fmt.val(report.forks)}`));
  lines.push(row(`  Contributors:   ${fmt.val(report.totalContributors)}`));
  lines.push(row(`  Open Issues:    ${fmt.val(report.openIssuesCount)}`));
  lines.push(row(`  Unanswered:     ${fmt.val(report.unansweredIssues)}`));
  lines.push(row(`  Last Commit:    ${fmt.dim(daysAgo(report.daysSinceLastCommit))}`));
  if (report.daysSinceLastRelease) {
    lines.push(row(`  Last Release:   ${fmt.dim(daysAgo(report.daysSinceLastRelease))}`));
  }
  if (report.activityDecline > 0) {
    lines.push(row(`  Activity:       ${kleur.red("↓ " + report.activityDecline + "%")} decline`));
  }
  if (report.busFactorOne) {
    lines.push(row(`  Bus Factor:     ${kleur.red("1")} (${report.topContributorPct}% from one person)`));
  }
  lines.push(row(""));

  // Death signals
  if (report.signals.length > 0) {
    lines.push(kleur.dim(`  ╠${border}╣`));
    lines.push(row(kleur.bold("  Death Signals")));
    lines.push(row(""));
    for (var signal of report.signals) {
      var icon = signal.severity === "critical" ? kleur.red("✖") : kleur.yellow("⚠");
      lines.push(row(`  ${icon} ${signal.signal}`));
    }
    lines.push(row(""));
  }

  lines.push(kleur.dim(`  ╚${border}╝`));
  lines.push("");

  // Epitaph
  if (report.description) {
    lines.push(kleur.dim(`  "${report.description}"`));
    lines.push("");
  }

  return lines.join("\n");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAge(days: number): string {
  var years = Math.floor(days / 365);
  var months = Math.floor((days % 365) / 30);
  if (years > 0) return `${years}y ${months}m`;
  return `${months}m`;
}

function daysAgo(days: number): string {
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m ago`;
}

function statusBadge(status: HealthStatus): string {
  const colors: Record<HealthStatus, (text: string) => string> = {
    alive: kleur.green,
    declining: kleur.yellow,
    "on life support": kleur.red,
    dead: (t) => kleur.bgRed().white(` ${t} `),
  };
  return (colors[status] || kleur.white)(status.toUpperCase());
}

function scoreBadge(score: number): string {
  if (score >= 80) return kleur.green(String(score));
  if (score >= 50) return kleur.yellow(String(score));
  return kleur.red(String(score));
}
