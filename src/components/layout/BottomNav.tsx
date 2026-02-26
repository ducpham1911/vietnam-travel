"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Briefcase } from "lucide-react";

const tabs = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/map", label: "Map", icon: Map },
  { href: "/trips", label: "My Trips", icon: Briefcase },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-dark-bg/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 pt-3 transition-colors ${
                isActive ? "text-brand-gold" : "text-text-secondary"
              }`}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
