import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 14 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const extraFull = rating - fullStars >= 0.75;

  const totalFull = fullStars + (extraFull ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: totalFull }).map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-brand-gold text-brand-gold" />
      ))}
      {hasHalf && <StarHalf size={size} className="fill-brand-gold text-brand-gold" />}
      {Array.from({ length: 5 - totalFull - (hasHalf ? 1 : 0) }).map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-elevated-bg" />
      ))}
      <span className="ml-1 text-xs text-text-secondary">{rating.toFixed(1)}</span>
    </div>
  );
}
