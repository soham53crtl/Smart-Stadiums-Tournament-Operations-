// components/RoleSwitcher.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROLES = [
  { code: "F", label: "Fan", href: "/fan" },
  { code: "O", label: "Ops", href: "/ops" },
  { code: "V", label: "Volunteer", href: "/volunteer" },
  { code: "S", label: "Staff", href: "/staff" },
] as const;

export default function RoleSwitcher() {
  const pathname = usePathname();

  return (
    <nav aria-label="Switch role view" className="border-b border-slate bg-ink">
      <ul className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
        {ROLES.map((role) => {
          const isActive = pathname?.startsWith(role.href);
          return (
            <li key={role.href}>
              <Link
                href={role.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 font-display text-sm transition-colors ${
                  isActive
                    ? "border-signal text-chalk"
                    : "border-transparent text-chalk-muted hover:text-chalk"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 items-center justify-center rounded-sm font-data text-xs ${
                    isActive ? "bg-signal text-ink" : "bg-panel-raised text-chalk-muted"
                  }`}
                >
                  {role.code}
                </span>
                {role.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
