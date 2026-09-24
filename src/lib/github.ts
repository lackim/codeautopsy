import { execFile } from "node:child_process";

const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const GH_TIMEOUT_MS = 20_000;

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

export interface GitHubClient {
  get<T>(endpoint: string): Promise<T | null>;
}

export interface ParsedRepository {
  owner: string;
  repo: string;
}

function gh<T>(endpoint: string): Promise<T | null> {
  return new Promise((resolve) => {
    execFile(
      "gh",
      ["api", endpoint],
      {
        encoding: "utf-8",
        // GitHub issue payloads can include large bodies. Pagination keeps the
        // total bounded, while a generous per-page buffer avoids false failures.
        maxBuffer: 10 * 1024 * 1024,
        timeout: GH_TIMEOUT_MS,
        windowsHide: true,
      },
      (error, stdout) => {
        if (error) {
          resolve(null);
          return;
        }

        try {
          resolve(JSON.parse(stdout) as T);
        } catch {
          resolve(null);
        }
      },
    );
  });
}

async function ghList<T>(client: GitHubClient, endpoint: string, maxPages = MAX_PAGES): Promise<T[]> {
  const items: T[] = [];
  const separator = endpoint.includes("?") ? "&" : "?";

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await client.get<T[]>(
      `${endpoint}${separator}per_page=${PAGE_SIZE}&page=${page}`,
    );
    if (!result) throw new Error(`GitHub API request failed: ${endpoint}`);

    items.push(...result);
    if (result.length < PAGE_SIZE) break;
  }

  return items;
}

const defaultClient: GitHubClient = { get: gh };

export async function fetchRepoData(
  owner: string,
  repo: string,
  client: GitHubClient = defaultClient,
): Promise<RepositoryData | null> {
  const repoInfo = await client.get<RepositoryInfo>(`repos/${owner}/${repo}`);
  if (!repoInfo) return null;

  // Run independent collections concurrently and cap each one so large repositories
  // remain responsive instead of downloading their complete history.
  const [commits, issues, contributors, releases, participation] = await Promise.all([
    ghList<CommitInfo>(client, `repos/${owner}/${repo}/commits`),
    ghList<IssueInfo>(client, `repos/${owner}/${repo}/issues?state=open`),
    ghList<ContributorInfo>(client, `repos/${owner}/${repo}/contributors`),
    ghList<ReleaseInfo>(client, `repos/${owner}/${repo}/releases`, 1),
    client.get<ParticipationInfo>(`repos/${owner}/${repo}/stats/participation`),
  ]);

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
