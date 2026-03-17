import { phase, status, success, error, fatal, fmt } from "@shipcli/core/output";
import { spinner } from "@shipcli/core/spinner";
import { fetchRepoData, parseRepoArg } from "../lib/github.js";
import { analyze } from "../lib/analyze.js";
import { renderCertificate } from "../lib/certificate.js";

export async function run(target, options) {
  if (!target) {
    fatal("Please provide a GitHub repository.", "Usage: codeautopsy <owner/repo>");
  }

  var parsed = parseRepoArg(target);
  if (!parsed) {
    fatal("Invalid repository format.", "Use: owner/repo or https://github.com/owner/repo");
  }

  phase(`Performing autopsy on ${fmt.app(parsed.owner + "/" + parsed.repo)}`);

  var s = spinner("Fetching repository data...").start();
  var data = await fetchRepoData(parsed.owner, parsed.repo);

  if (!data) {
    s.error({ text: "Repository not found" });
    fatal(
      `Could not find ${parsed.owner}/${parsed.repo}`,
      "Make sure the repository exists and you have access. Run: gh auth login"
    );
  }
  s.success({ text: "Repository data fetched" });

  var s2 = spinner("Analyzing death signals...").start();
  var report = analyze(data);
  s2.success({ text: `Analysis complete — ${report.signals.length} signals found` });

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderCertificate(report));

  if (report.status === "alive") {
    success("This project appears to be alive and well!");
  } else if (report.status === "declining") {
    status(fmt.dim("Prognosis: declining health. May need intervention."));
  } else {
    status(fmt.dim("Rest in peace."));
  }
}
