interface PriceLevelProps {
  level: number;
}

export function PriceLevel({ level }: PriceLevelProps) {
  return (
    <span className="text-sm font-medium text-brand-teal">
      {"₫".repeat(level)}
      <span className="text-elevated-bg">{"₫".repeat(3 - level)}</span>
    </span>
  );
}
