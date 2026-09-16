const STEPS = [
  {
    number: "01",
    title: "Authenticate",
    command: "gh auth login",
    description: "Use the GitHub CLI credentials already trusted on your machine.",
  },
  {
    number: "02",
    title: "Analyze",
    command: "codeautopsy atom/atom",
    description: "Inspect commits, issues, releases, contributors, and activity trends.",
  },
  {
    number: "03",
    title: "Automate",
    command: "codeautopsy atom/atom --json",
    description: "Feed the health score and detected signals into scripts or CI workflows.",
  },
  {
    number: "04",
    title: "Share",
    command: "codeautopsy atom/atom --share",
    description: "Generate a polished death-certificate card directly from the analysis.",
  },
];

export function FeatureShowcase() {
  return (
    <div className="workflow-grid grid gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800 md:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step) => (
        <div key={step.title} className="workflow-step bg-neutral-950 p-6 sm:p-7">
          <div className="step-number">{step.number}</div>
          <h3 className="mt-8 text-lg font-semibold text-white">{step.title}</h3>
          <code className="mt-3 block overflow-hidden text-ellipsis text-xs text-emerald-400">$ {step.command}</code>
          <p className="mt-4 text-sm leading-6 text-neutral-500">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
