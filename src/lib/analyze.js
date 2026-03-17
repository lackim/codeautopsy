var DAY_MS = 24 * 60 * 60 * 1000;

export function analyze(data) {
  var { repo, commits, issues, contributors, releases, participation } = data;
  var now = Date.now();

  // --- Time signals ---
  var createdAt = new Date(repo.created_at);
  var lastPush = new Date(repo.pushed_at);
  var daysSinceLastPush = Math.floor((now - lastPush.getTime()) / DAY_MS);
  var ageInDays = Math.floor((now - createdAt.getTime()) / DAY_MS);

  var lastCommitDate = commits.length > 0 ? new Date(commits[0].commit.author.date) : lastPush;
  var daysSinceLastCommit = Math.floor((now - lastCommitDate.getTime()) / DAY_MS);

  // --- Commit activity ---
  var commitDates = commits.map((c) => new Date(c.commit.author.date));
  var commitsByMonth = groupByMonth(commitDates);
  var monthlyTrend = calculateTrend(commitsByMonth);

  // --- Issues ---
  var openIssues = issues.filter((i) => i.state === "open" && !i.pull_request);
  var closedIssues = issues.filter((i) => i.state === "closed" && !i.pull_request);
  var unansweredIssues = openIssues.filter((i) => i.comments === 0);
  var oldestUnanswered = unansweredIssues.length > 0
    ? Math.floor((now - new Date(unansweredIssues[unansweredIssues.length - 1].created_at).getTime()) / DAY_MS)
    : 0;

  // --- Contributors ---
  var totalContributors = contributors.length;
  var topContributor = contributors[0];
  var topContributorPct = topContributor
    ? Math.round((topContributor.contributions / contributors.reduce((s, c) => s + c.contributions, 0)) * 100)
    : 0;
  var busFactorOne = topContributorPct > 80;

  // --- Releases ---
  var lastRelease = releases.length > 0 ? new Date(releases[0].published_at) : null;
  var daysSinceLastRelease = lastRelease ? Math.floor((now - lastRelease.getTime()) / DAY_MS) : null;

  // --- Participation (weekly commits last year) ---
  var weeklyActivity = participation?.all || [];
  var recentWeeks = weeklyActivity.slice(-12);
  var olderWeeks = weeklyActivity.slice(-52, -12);
  var recentAvg = recentWeeks.length > 0 ? recentWeeks.reduce((s, w) => s + w, 0) / recentWeeks.length : 0;
  var olderAvg = olderWeeks.length > 0 ? olderWeeks.reduce((s, w) => s + w, 0) / olderWeeks.length : 0;
  var activityDecline = olderAvg > 0 ? Math.round((1 - recentAvg / olderAvg) * 100) : 0;

  // --- Death signals ---
  var signals = [];

  if (daysSinceLastCommit > 365) {
    signals.push({ signal: "No commits in over a year", severity: "critical", days: daysSinceLastCommit });
  } else if (daysSinceLastCommit > 180) {
    signals.push({ signal: "No commits in 6+ months", severity: "warning", days: daysSinceLastCommit });
  }

  if (unansweredIssues.length > 5) {
    signals.push({ signal: `${unansweredIssues.length} unanswered issues`, severity: unansweredIssues.length > 20 ? "critical" : "warning" });
  }

  if (oldestUnanswered > 365) {
    signals.push({ signal: `Oldest unanswered issue: ${Math.floor(oldestUnanswered / 30)} months`, severity: "critical" });
  }

  if (busFactorOne) {
    signals.push({ signal: `Bus factor 1: top contributor has ${topContributorPct}% of commits`, severity: "warning" });
  }

  if (activityDecline > 50) {
    signals.push({ signal: `Activity declined ${activityDecline}% vs previous period`, severity: "critical" });
  } else if (activityDecline > 25) {
    signals.push({ signal: `Activity declined ${activityDecline}% vs previous period`, severity: "warning" });
  }

  if (daysSinceLastRelease && daysSinceLastRelease > 365) {
    signals.push({ signal: `No release in ${Math.floor(daysSinceLastRelease / 30)} months`, severity: "warning" });
  }

  if (repo.archived) {
    signals.push({ signal: "Repository is archived", severity: "critical" });
  }

  if (monthlyTrend < -0.5) {
    signals.push({ signal: "Declining commit trend", severity: "warning" });
  }

  // --- Health score (0-100, lower = more dead) ---
  var score = 100;
  for (var s of signals) {
    if (s.severity === "critical") score -= 25;
    if (s.severity === "warning") score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  // --- Cause of death ---
  var causeOfDeath = determineCauseOfDeath(signals, data);

  // --- Status ---
  var status;
  if (score >= 80) status = "alive";
  else if (score >= 50) status = "declining";
  else if (score >= 25) status = "on life support";
  else status = "dead";

  return {
    name: `${repo.owner.login}/${repo.name}`,
    fullName: repo.full_name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssuesCount: openIssues.length,
    createdAt: createdAt.toISOString(),
    lastCommit: lastCommitDate.toISOString(),
    lastPush: lastPush.toISOString(),
    lastRelease: lastRelease ? lastRelease.toISOString() : null,
    ageInDays,
    daysSinceLastCommit,
    daysSinceLastPush,
    daysSinceLastRelease,
    totalContributors,
    topContributorPct,
    busFactorOne,
    unansweredIssues: unansweredIssues.length,
    activityDecline,
    commitsByMonth,
    signals,
    score,
    status,
    causeOfDeath,
    archived: repo.archived,
  };
}

function determineCauseOfDeath(signals, data) {
  var criticals = signals.filter((s) => s.severity === "critical");

  if (data.repo.archived) return "Archived by owner";
  if (criticals.find((s) => s.signal.includes("Bus factor"))) return "Sole maintainer burnout";
  if (criticals.find((s) => s.signal.includes("Activity declined"))) return "Gradual abandonment";
  if (criticals.find((s) => s.signal.includes("unanswered issues")) && criticals.find((s) => s.signal.includes("No commits"))) return "Maintainer disappeared";
  if (criticals.find((s) => s.signal.includes("No commits"))) return "Development ceased";
  if (signals.length === 0) return "Still breathing";

  return "Slow decline";
}

function groupByMonth(dates) {
  var months = {};
  for (var d of dates) {
    var key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = (months[key] || 0) + 1;
  }
  return months;
}

function calculateTrend(monthlyData) {
  var keys = Object.keys(monthlyData).sort();
  if (keys.length < 3) return 0;

  var recent = keys.slice(-3);
  var older = keys.slice(-6, -3);

  var recentAvg = recent.reduce((s, k) => s + monthlyData[k], 0) / recent.length;
  var olderAvg = older.length > 0
    ? older.reduce((s, k) => s + (monthlyData[k] || 0), 0) / older.length
    : recentAvg;

  if (olderAvg === 0) return 0;
  return (recentAvg - olderAvg) / olderAvg;
}
