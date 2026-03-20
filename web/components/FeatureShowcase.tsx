const FEATURES = [
  {
    title: "Death Signals",
    description: "Detects 8+ health signals: commit activity, bus factor, unanswered issues, archive status, and more.",
    icon: "💀",
  },
  {
    title: "Health Score",
    description: "0-100 score with clear status: alive, declining, on life support, or dead.",
    icon: "📊",
  },
  {
    title: "Shareable Cards",
    description: "Generate OG image death certificates for X/LinkedIn with --share.",
    icon: "🖼",
  },
  {
    title: "Cause of Death",
    description: "AI-style diagnosis: archived by owner, maintainer burnout, gradual abandonment, and more.",
    icon: "🔍",
  },
];

export function FeatureShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors"
        >
          <div className="text-2xl mb-3">{f.icon}</div>
          <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
          <p className="text-neutral-400 text-sm">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
