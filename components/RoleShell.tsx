// components/RoleShell.tsx
// Every role page (Fan/Ops/Volunteer/Staff) needs the same three things: the
// role-switcher nav, the live status ribbon, and a consistently-constrained
// <main> wrapper. Before this component, each of the four page files
// duplicated that structure verbatim. Extracting it here means a layout
// change (e.g. adjusting the max-width or adding a footer) happens once,
// and each page file is left containing only what's actually specific to
// that role.

import RoleSwitcher from "@/components/RoleSwitcher";
import LiveRibbon from "@/components/LiveRibbon";
import type { LiveState } from "@/lib/mockData";

interface RoleShellProps {
  state: LiveState;
  children: React.ReactNode;
}

export default function RoleShell({ state, children }: RoleShellProps) {
  return (
    <>
      <RoleSwitcher />
      <LiveRibbon state={state} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">{children}</main>
    </>
  );
}
