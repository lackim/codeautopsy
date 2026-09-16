import { execFileSync } from "node:child_process";

export interface RepositoryInfo {
  owner: { login: string };
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  pushed_at: string;
  archived: boolean;
}

export interface CommitInfo {
  commit: { author: { date: string } };
}

export interface IssueInfo {
  state: "open" | "closed";
  comments: number;
  created_at: string;
  pull_request?: unknown;
}

export interface ContributorInfo {
  login: string;
  contributions: number;
}

export interface ReleaseInfo {
  published_at: string;
}

export interface ParticipationInfo {
  all: number[];
}

export interface RepositoryData {
  repo: RepositoryInfo;
  commits: CommitInfo[];
  issues: IssueInfo[];
  contributors: ContributorInfo[];
  releases: ReleaseInfo[];
  participation: ParticipationInfo | null;
}

export interface ParsedRepository {
  owner: string;
  repo: string;
}

function gh<T>(endpoint: string): T | null {
  try {
    const result = execFileSync("gh", ["api", endpoint, "--paginate"], {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["pipe", "pipe", "ignore"],
    });
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}

function ghList<T>(endpoint: string, perPage = 100): T[] {
  try {
    const separator = endpoint.includes("?") ? "&" : "?";
    const result = execFileSync("gh", ["api", `${endpoint}${separator}per_page=${perPage}`, "--paginate"], {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["pipe", "pipe", "ignore"],
    });
    // gh --paginate concatenates JSON arrays, need to handle
    // Sometimes it returns multiple arrays concatenated
    const trimmed = result.trim();
    if (trimmed.startsWith("[")) {
      // Could be multiple arrays concatenated: ][
      const fixed = "[" + trimmed.replace(/\]\s*\[/g, ",") + "]";
      // If it was already a single array, the outer [] will double-wrap
      const parsed = JSON.parse(fixed) as T[][];
      // Flatten if double-wrapped
      if (parsed.length === 1 && Array.isArray(parsed[0])) return parsed[0];
      // If it was multiple arrays merged, flatten
      return parsed.flat();
    }
    return JSON.parse(trimmed) as T[];
  } catch {
    return [];
  }
}

export async function fetchRepoData(owner: string, repo: string): Promise<RepositoryData | null> {
  const repoInfo = gh<RepositoryInfo>(`repos/${owner}/${repo}`);
  if (!repoInfo) return null;

  // Fetch in parallel using Promise.all with sync calls wrapped
  const [commits, issues, contributors, releases] = await Promise.all([
    Promise.resolve(ghList<CommitInfo>(`repos/${owner}/${repo}/commits`)),
    Promise.resolve(ghList<IssueInfo>(`repos/${owner}/${repo}/issues?state=all`)),
    Promise.resolve(ghList<ContributorInfo>(`repos/${owner}/${repo}/contributors`)),
    Promise.resolve(ghList<ReleaseInfo>(`repos/${owner}/${repo}/releases`)),
  ]);

  // Get recent commit activity (last year, weekly)
  const participation = gh<ParticipationInfo>(`repos/${owner}/${repo}/stats/participation`);

  return {
    repo: repoInfo,
    commits,
    issues,
    contributors,
    releases,
    participation,
  };
}

const VALID_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function parseRepoArg(target: string): ParsedRepository | null {
  // Handle: owner/repo, github.com/owner/repo, https://github.com/owner/repo
  const cleaned = target
    .replace(/^https?:\/\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");

  const parts = cleaned.split("/");
  if (parts.length < 2) return null;

  const owner = parts[0];
  const repo = parts[1];

  // Validate against GitHub's allowed characters
  if (!VALID_NAME.test(owner) || !VALID_NAME.test(repo)) return null;

  return { owner, repo };
}
