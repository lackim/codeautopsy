import { fmt } from "@shipcli/core/output";
import kleur from "kleur";
import type { AnalysisReport, HealthStatus } from "./analyze.js";

const WIDTH = 50;
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g;
// Repository metadata is untrusted terminal input. Remove C0/C1 controls,
// including ESC and OSC terminators, before it reaches the user's terminal.
const TERMINAL_CONTROL_RE = /[\u0000-\u001f\u007f-\u009f]/g;

function safeTerminalText(value: string): string {
  return value.replace(TERMINAL_CONTROL_RE, " ").replace(/\s+/g, " ").trim();
}

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

function wrapText(text: string, width: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > width) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let start = 0; start < word.length; start += width) {
        const chunk = word.slice(start, start + width);
        if (chunk.length === width) lines.push(chunk);
        else current = chunk;
      }
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= width) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export function renderCertificate(report: AnalysisReport): string {
  const lines: string[] = [];
  const border = "═".repeat(WIDTH);
  const isDead = report.status === "dead";

  lines.push("");
  lines.push(kleur.dim(`  ╔${border}╗`));
  lines.push(row(kleur.bold(isDead ? "         DEATH CERTIFICATE           " : "      REPOSITORY HEALTH REPORT         ")));
  lines.push(kleur.dim(`  ╠${border}╣`));
  lines.push(row(`  Name:      ${fmt.bold(safeTerminalText(report.fullName))}`));
  lines.push(row(`  Born:      ${formatDate(report.createdAt)}`));
  lines.push(row(`  ${isDead ? "Died" : "Last Commit"}: ${formatDate(report.lastCommit)}`));
  lines.push(row(`  ${isDead ? "Lifespan" : "Age"}:  ${formatAge(isDead ? report.lifespanInDays : report.ageInDays)}`));
  lines.push(row(`  Language:  ${safeTerminalText(report.language || "Unknown")}`));
  lines.push(row(""));
  lines.push(row(`  ${isDead ? "Cause" : "Condition"}: ${isDead ? kleur.red(report.causeOfDeath) : report.causeOfDeath}`));
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
      const wrappedSignal = wrapText(safeTerminalText(signal.signal), WIDTH - 4);
      lines.push(row(`  ${icon} ${wrappedSignal[0]}`));
      for (const continuation of wrappedSignal.slice(1)) {
        lines.push(row(`    ${continuation}`));
      }
    }
    lines.push(row(""));
  }

  lines.push(kleur.dim(`  ╚${border}╝`));
  lines.push("");

  // Epitaph
  if (report.description) {
    lines.push(kleur.dim(`  "${safeTerminalText(report.description)}"`));
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
