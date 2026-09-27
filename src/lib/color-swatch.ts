// Best-effort mapping from a free-text color description (as written on a
// listing, e.g. "Gris GT argent métallisé") to a CSS color for a visual
// swatch. Descriptions are free text, not structured data, so this is a
// heuristic keyword match — good enough for a visual hint, not exact paint.
const KEYWORDS: [RegExp, string][] = [
  [/noir|black|obsidienne/i, "#111318"],
  [/blanc|white|nacré|ivory/i, "#f5f5f0"],
  [/argent|silver|daytona/i, "#c7c9cc"],
  [/gris|grey|gray|graphite|nardo|anthracite/i, "#6b6f76"],
  [/rouge|red|carmin|firenze/i, "#b32222"],
  [/bleu|blue|marina|tanzanite|isle of man|montecarlo/i, "#2456a6"],
  [/vert|green|pangea/i, "#2f6b45"],
  [/orange|sebring/i, "#d4681b"],
  [/jaune|yellow/i, "#e0b800"],
  [/beige|cognac|tan/i, "#c9a876"],
  [/marron|brown|bronze/i, "#5a3a22"],
  [/or |gold/i, "#c9a227"],
  [/violet|purple|améthyste/i, "#5b3a86"],
  [/rose|pink/i, "#d68fb0"],
];

export function colorSwatch(description: string): string {
  for (const [pattern, color] of KEYWORDS) {
    if (pattern.test(description)) return color;
  }
  return "#9a9a9a";
}
