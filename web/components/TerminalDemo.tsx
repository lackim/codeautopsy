"use client";

import { useState, useEffect } from "react";

const DEMO_LINES = [
  { text: "$ codeautopsy atom/atom", delay: 0, color: "#e5e5e5" },
  { text: "", delay: 400 },
  { text: "==> Performing autopsy on atom/atom", delay: 600, color: "#06b6d4" },
  { text: "  ✔ Repository data fetched", delay: 1200, color: "#22c55e" },
  { text: "  ✔ Analysis complete — 6 signals found", delay: 1800, color: "#22c55e" },
  { text: "", delay: 2000 },
  { text: "  ╔══════════════════════════════════════════╗", delay: 2200, color: "#525252" },
  { text: "  ║       DEATH CERTIFICATE                 ║", delay: 2300, color: "#e5e5e5" },
  { text: "  ╠══════════════════════════════════════════╣", delay: 2400, color: "#525252" },
  { text: "  ║  Name:    atom/atom                     ║", delay: 2500, color: "#e5e5e5" },
  { text: "  ║  Cause:   Archived by owner             ║", delay: 2600, color: "#ef4444" },
  { text: "  ║  Status:  DEAD                          ║", delay: 2700, color: "#ef4444" },
  { text: "  ║  Score:   0/100                         ║", delay: 2800, color: "#ef4444" },
  { text: "  ╠══════════════════════════════════════════╣", delay: 2900, color: "#525252" },
  { text: "  ║  ✖ Repository is archived               ║", delay: 3000, color: "#ef4444" },
  { text: "  ║  ✖ No commits in over a year            ║", delay: 3100, color: "#ef4444" },
  { text: "  ║  ✖ Activity declined 100%               ║", delay: 3200, color: "#ef4444" },
  { text: "  ║  ⚠ Bus factor 1: 18% from one person   ║", delay: 3300, color: "#eab308" },
  { text: "  ╚══════════════════════════════════════════╝", delay: 3400, color: "#525252" },
  { text: "", delay: 3500 },
  { text: "    Rest in peace.", delay: 3600, color: "#737373" },
];

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    DEMO_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), line.delay + 200)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-dot" style={{ background: "#ff5f57" }} />
        <div className="terminal-dot" style={{ background: "#febc2e" }} />
        <div className="terminal-dot" style={{ background: "#28c840" }} />
        <span
          style={{ marginLeft: 12, color: "#737373", fontSize: 12 }}
        >
          codeautopsy
        </span>
      </div>
      <div className="terminal-body">
        {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: line.color || "#e5e5e5" }}>
            {line.text || "\u00A0"}
          </div>
        ))}
        {visibleLines < DEMO_LINES.length && (
          <span className="animate-pulse" style={{ color: "#06b6d4" }}>
            ▋
          </span>
        )}
      </div>
    </div>
  );
}
