import { fmt, box } from "@shipcli/core/output";
import kleur from "kleur";

export function renderCertificate(report) {
  var lines = [];

  lines.push("");
  lines.push(kleur.dim("  ╔══════════════════════════════════════════════════╗"));
  lines.push(kleur.dim("  ║") + kleur.bold("         DEATH CERTIFICATE           ") + kleur.dim("           ║"));
  lines.push(kleur.dim("  ╠══════════════════════════════════════════════════╣"));
  lines.push(kleur.dim("  ║") + `  Name:      ${fmt.bold(report.fullName)}`.padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Born:      ${formatDate(report.createdAt)}`.padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Died:      ${formatDate(report.lastCommit)}`.padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Age:       ${formatAge(report.ageInDays)}`.padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Language:  ${report.language || "Unknown"}`.padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + "".padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Cause:     ${kleur.red(report.causeOfDeath)}`.padEnd(55 + 9) + kleur.dim("║")); // +9 for ANSI codes
  lines.push(kleur.dim("  ║") + `  Status:    ${statusBadge(report.status)}`.padEnd(55 + 9) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Score:     ${scoreBadge(report.score)}/100`.padEnd(55 + 9) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + "".padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ╠══════════════════════════════════════════════════╣"));
  lines.push(kleur.dim("  ║") + kleur.bold("  Vital Signs") + "".padEnd(42) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + "".padEnd(55) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Stars:          ${fmt.val(report.stars)}`.padEnd(55 + 5) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Forks:          ${fmt.val(report.forks)}`.padEnd(55 + 5) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Contributors:   ${fmt.val(report.totalContributors)}`.padEnd(55 + 5) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Open Issues:    ${fmt.val(report.openIssuesCount)}`.padEnd(55 + 5) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Unanswered:     ${fmt.val(report.unansweredIssues)}`.padEnd(55 + 5) + kleur.dim("║"));
  lines.push(kleur.dim("  ║") + `  Last Commit:    ${fmt.dim(daysAgo(report.daysSinceLastCommit))}`.padEnd(55 + 5) + kleur.dim("║"));
  if (report.daysSinceLastRelease) {
    lines.push(kleur.dim("  ║") + `  Last Release:   ${fmt.dim(daysAgo(report.daysSinceLastRelease))}`.padEnd(55 + 5) + kleur.dim("║"));
  }
  if (report.activityDecline > 0) {
    lines.push(kleur.dim("  ║") + `  Activity:       ${kleur.red("↓ " + report.activityDecline + "%")} decline`.padEnd(55 + 9) + kleur.dim("║"));
  }
  if (report.busFactorOne) {
    lines.push(kleur.dim("  ║") + `  Bus Factor:     ${kleur.red("1")} (${report.topContributorPct}% from one person)`.padEnd(55 + 5) + kleur.dim("║"));
  }
  lines.push(kleur.dim("  ║") + "".padEnd(55) + kleur.dim("║"));

  // Death signals
  if (report.signals.length > 0) {
    lines.push(kleur.dim("  ╠══════════════════════════════════════════════════╣"));
    lines.push(kleur.dim("  ║") + kleur.bold("  Death Signals") + "".padEnd(40) + kleur.dim("║"));
    lines.push(kleur.dim("  ║") + "".padEnd(55) + kleur.dim("║"));
    for (var signal of report.signals) {
      var icon = signal.severity === "critical" ? kleur.red("✖") : kleur.yellow("⚠");
      var text = `  ${icon} ${signal.signal}`;
      lines.push(kleur.dim("  ║") + text.padEnd(55 + 9) + kleur.dim("║"));
    }
    lines.push(kleur.dim("  ║") + "".padEnd(55) + kleur.dim("║"));
  }

  lines.push(kleur.dim("  ╚══════════════════════════════════════════════════╝"));
  lines.push("");

  // Epitaph
  if (report.description) {
    lines.push(kleur.dim(`  "${report.description}"`));
    lines.push("");
  }

  return lines.join("\n");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAge(days) {
  var years = Math.floor(days / 365);
  var months = Math.floor((days % 365) / 30);
  if (years > 0) return `${years}y ${months}m`;
  return `${months}m`;
}

function daysAgo(days) {
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m ago`;
}

function statusBadge(status) {
  var colors = {
    alive: kleur.green,
    declining: kleur.yellow,
    "on life support": kleur.red,
    dead: (t) => kleur.bgRed().white(` ${t} `),
  };
  return (colors[status] || kleur.white)(status.toUpperCase());
}

function scoreBadge(score) {
  if (score >= 80) return kleur.green(String(score));
  if (score >= 50) return kleur.yellow(String(score));
  return kleur.red(String(score));
}
