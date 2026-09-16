import { fatal, fmt, phase, status, success } from "@shipcli/core/output";
import { loadShipcliConfig } from "@shipcli/core/project-config";
import { spinner } from "@shipcli/core/spinner";
import { fetchRepoData, parseRepoArg } from "../lib/github.js";
import { analyze } from "../lib/analyze.js";
import { renderCertificate } from "../lib/certificate.js";
import { deathCertificateTemplate } from "../share/card.js";

export interface RunOptions {
  json?: boolean;
  share?: boolean;
}

export async function run(target: string | undefined, options: RunOptions): Promise<void> {
  if (!target) {
    fatal("Please provide a GitHub repository.", "Usage: codeautopsy <owner/repo>");
  }

  const parsed = parseRepoArg(target);
  if (!parsed) {
    fatal("Invalid repository format.", "Use: owner/repo or https://github.com/owner/repo");
  }

  phase(`Performing autopsy on ${fmt.app(parsed.owner + "/" + parsed.repo)}`);

  const fetchSpinner = spinner("Fetching repository data...").start();
  const data = await fetchRepoData(parsed.owner, parsed.repo);

  if (!data) {
    fetchSpinner.error({ text: "Repository not found" });
    fatal(
      `Could not find ${parsed.owner}/${parsed.repo}`,
      "Make sure the repository exists and you have access. Run: gh auth login"
    );
  }
  fetchSpinner.success({ text: "Repository data fetched" });

  const analysisSpinner = spinner("Analyzing death signals...").start();
  const report = analyze(data);
  analysisSpinner.success({ text: `Analysis complete — ${report.signals.length} signals found` });

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderCertificate(report));

  if (options.share) {
    const config = await loadShipcliConfig();
    if (config.share?.enabled !== false) {
      const shareSpinner = spinner("Generating share image...").start();
      const slug = `${parsed.owner}-${parsed.repo}`;
      const { share } = await import("@shipcli/share");
      await share(deathCertificateTemplate, report, {
        toolName: "codeautopsy",
        filename: `codeautopsy-${slug}.png`,
      });
      shareSpinner.success({ text: "Share image generated" });
    }
  }

  if (report.status === "alive") {
    success("This project appears to be alive and well!");
  } else if (report.status === "declining") {
    status(fmt.dim("Prognosis: declining health. May need intervention."));
  } else {
    status(fmt.dim("Rest in peace."));
  }
}
