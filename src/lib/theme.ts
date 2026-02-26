export const cityGradients: [string, string][] = [
  ["#C62828", "#EF5350"], // Hà Nội - Red
  ["#1565C0", "#42A5F5"], // Đà Nẵng - Blue
  ["#E65100", "#FF9800"], // HCM - Orange
  ["#FFB300", "#FFD54F"], // Hội An - Gold
  ["#6A1B9A", "#AB47BC"], // Huế - Purple
  ["#00838F", "#26C6DA"], // Nha Trang - Cyan
  ["#00897B", "#4DB6AC"], // Phú Quốc - Teal
  ["#2E7D32", "#66BB6A"], // Đà Lạt - Green
  ["#37474F", "#78909C"], // Sa Pa - Slate
  ["#0D47A1", "#1E88E5"], // Hạ Long - Deep Blue
];

export const categoryColors: Record<string, string> = {
  landmark: "#F97316",  // orange
  temple: "#C62828",    // red
  beach: "#06B6D4",     // cyan
  restaurant: "#22C55E",// green
  market: "#A855F7",    // purple
  museum: "#92400E",    // brown
  nature: "#34D399",    // mint
  cafe: "#6366F1",      // indigo
  nightlife: "#EC4899", // pink
};

export function getCityGradient(gradientIndex: number): [string, string] {
  return cityGradients[Math.min(gradientIndex, cityGradients.length - 1)];
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] || "#8B949E";
}
