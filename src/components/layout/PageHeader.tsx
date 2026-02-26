"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, action }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between px-4 pt-4 pb-2">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-bg"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
