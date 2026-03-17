import { execSync } from "child_process";

function gh(endpoint) {
  try {
    var result = execSync(`gh api "${endpoint}" --paginate 2>/dev/null`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

function ghList(endpoint, perPage = 100) {
  try {
    var result = execSync(
      `gh api "${endpoint}?per_page=${perPage}" --paginate 2>/dev/null`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
    // gh --paginate concatenates JSON arrays, need to handle
    // Sometimes it returns multiple arrays concatenated
    var trimmed = result.trim();
    if (trimmed.startsWith("[")) {
      // Could be multiple arrays concatenated: ][
      var fixed = "[" + trimmed.replace(/\]\s*\[/g, ",") + "]";
      // If it was already a single array, the outer [] will double-wrap
      var parsed = JSON.parse(fixed);
      // Flatten if double-wrapped
      if (parsed.length === 1 && Array.isArray(parsed[0])) return parsed[0];
      // If it was multiple arrays merged, flatten
      return parsed.flat();
    }
    return JSON.parse(trimmed);
  } catch {
    return [];
  }
}

export async function fetchRepoData(owner, repo) {
  var repoInfo = gh(`repos/${owner}/${repo}`);
  if (!repoInfo) return null;

  // Fetch in parallel using Promise.all with sync calls wrapped
  var [commits, issues, contributors, releases] = await Promise.all([
    Promise.resolve(ghList(`repos/${owner}/${repo}/commits`)),
    Promise.resolve(ghList(`repos/${owner}/${repo}/issues?state=all`)),
    Promise.resolve(ghList(`repos/${owner}/${repo}/contributors`)),
    Promise.resolve(ghList(`repos/${owner}/${repo}/releases`)),
  ]);

  // Get recent commit activity (last year, weekly)
  var participation = gh(`repos/${owner}/${repo}/stats/participation`);

  return {
    repo: repoInfo,
    commits,
    issues,
    contributors,
    releases,
    participation,
  };
}

export function parseRepoArg(target) {
  // Handle: owner/repo, github.com/owner/repo, https://github.com/owner/repo
  var cleaned = target
    .replace(/^https?:\/\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");

  var parts = cleaned.split("/");
  if (parts.length < 2) return null;

  return { owner: parts[0], repo: parts[1] };
}
