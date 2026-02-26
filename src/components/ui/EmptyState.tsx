import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-bg">
        <Icon size={28} className="text-text-tertiary" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
