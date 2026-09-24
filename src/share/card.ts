import type { SatoriElement } from "@shipcli/share";
import type { AnalysisReport } from "../lib/analyze.js";

// Satori uses React.createElement-style objects: { type, props, children }
function h(
  type: string,
  props: Record<string, unknown>,
  ...children: Array<SatoriElement | string>
): SatoriElement {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

export function deathCertificateTemplate(report: AnalysisReport): SatoriElement {
  var statusColor = report.score >= 80 ? "#22c55e" : report.score >= 50 ? "#eab308" : "#ef4444";
  var isDead = report.status === "dead";
  var bgColor = "#0f0f0f";
  var cardBg = "#1a1a1a";
  var border = "#333";
  var textDim = "#888";
  var textMain = "#e5e5e5";

  return h("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      backgroundColor: bgColor,
      padding: "48px",
      fontFamily: "Inter, sans-serif",
      color: textMain,
    },
  },
    // Header
    h("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
      },
    },
      h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
        },
      },
        h("div", {
          style: {
            fontSize: "16px",
            color: textDim,
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: "8px",
          },
        }, isDead ? "DEATH CERTIFICATE" : "REPOSITORY HEALTH REPORT"),
        h("div", {
          style: {
            fontSize: "42px",
            fontWeight: 700,
            color: "#fff",
          },
        }, report.fullName),
      ),
      // Score badge
      h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: cardBg,
          border: `2px solid ${statusColor}`,
          borderRadius: "16px",
          padding: "16px 24px",
        },
      },
        h("div", {
          style: {
            fontSize: "48px",
            fontWeight: 700,
            color: statusColor,
          },
        }, String(report.score)),
        h("div", {
          style: {
            fontSize: "14px",
            color: textDim,
          },
        }, "/ 100"),
      ),
    ),

    // Main card
    h("div", {
      style: {
        display: "flex",
        flex: 1,
        backgroundColor: cardBg,
        borderRadius: "16px",
        border: `1px solid ${border}`,
        padding: "32px",
        gap: "32px",
      },
    },
      // Left column
      h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "16px",
        },
      },
        infoRow(isDead ? "Cause of Death" : "Condition", report.causeOfDeath, isDead ? "#ef4444" : statusColor),
        infoRow("Status", report.status.toUpperCase(), statusColor),
        infoRow("Born", formatDate(report.createdAt), textMain),
        infoRow(isDead ? "Died" : "Last Commit", formatDate(report.lastCommit), textMain),
        infoRow(isDead ? "Lifespan" : "Age", formatAge(isDead ? report.lifespanInDays : report.ageInDays), textMain),
        infoRow("Language", report.language || "Unknown", textMain),
      ),
      // Right column
      h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "16px",
        },
      },
        infoRow("Stars", String(report.stars), "#eab308"),
        infoRow("Forks", String(report.forks), textMain),
        infoRow("Contributors", String(report.totalContributors), textMain),
        infoRow("Open Issues", String(report.openIssuesCount), textMain),
        infoRow("Unanswered", String(report.unansweredIssues), report.unansweredIssues > 5 ? "#ef4444" : textMain),
        report.activityDecline > 0
          ? infoRow("Activity", `↓ ${report.activityDecline}%`, "#ef4444")
          : infoRow("Activity", "Stable", "#22c55e"),
      ),
    ),

    // Footer
    h("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "24px",
      },
    },
      h("div", {
        style: { fontSize: "14px", color: textDim },
      }, report.description ? `"${report.description}"` : ""),
      h("div", {
        style: { fontSize: "14px", color: textDim },
      }, "codeautopsy · Built with shipcli"),
    ),
  );
}

function infoRow(label: string, value: string, valueColor: string): SatoriElement {
  return h("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  },
    h("div", {
      style: { fontSize: "16px", color: "#888" },
    }, label),
    h("div", {
      style: { fontSize: "16px", fontWeight: 700, color: valueColor },
    }, value),
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAge(days: number): string {
  var years = Math.floor(days / 365);
  var months = Math.floor((days % 365) / 30);
  if (years > 0) return `${years}y ${months}m`;
  return `${months}m`;
}
