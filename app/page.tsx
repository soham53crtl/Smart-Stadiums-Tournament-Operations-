// app/page.tsx
import Link from "next/link";

const AREAS = [
  { area: "Navigation", mode: "Fan", href: "/fan" },
  { area: "Multilingual assistance", mode: "Fan", href: "/fan" },
  { area: "Transportation", mode: "Fan", href: "/fan" },
  { area: "Sustainability", mode: "Fan / Ops", href: "/fan" },
  { area: "Crowd management", mode: "Ops", href: "/ops" },
  { area: "Operational intelligence", mode: "Ops", href: "/ops" },
  { area: "Real-time decision support", mode: "Ops / Staff", href: "/ops" },
  { area: "Accessibility", mode: "Staff", href: "/staff" },
];

const ROLES = [
  {
    title: "Fan",
    href: "/fan",
    code: "F",
    description: "Navigation, multilingual chat, and transport guidance during the match.",
  },
  {
    title: "Ops / Organizer",
    href: "/ops",
    code: "O",
    description: "Real-time crowd intelligence and plain-language operational recommendations.",
  },
  {
    title: "Volunteer",
    href: "/volunteer",
    code: "V",
    description: "Prioritized, step-by-step task assignments matched to location and skill.",
  },
  {
    title: "Venue Staff",
    href: "/staff",
    code: "S",
    description: "Accessibility-first routing and incident classification with response protocols.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6">
      <section className="flex flex-col gap-4">
        <p className="font-data text-xs tracking-widest text-pitch">
          FIFA WORLD CUP 2026 · SMART STADIUMS
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-chalk sm:text-5xl">
          One live stadium state.
          <br />
          Four ways to act on it.
        </h1>
        <p className="max-w-xl font-body text-base text-chalk-muted">
          StadiumSense is a GenAI context engine that reads the same live venue data — crowd
          density, gate waits, transport, incidents — and reasons differently depending on
          who&apos;s asking: a fan, an operations lead, a volunteer, or venue staff.
        </p>
      </section>

      <section aria-labelledby="roles-heading" className="flex flex-col gap-6">
        <h2 id="roles-heading" className="font-display text-xl text-chalk">
          Choose a role
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <Link
              key={role.href}
              href={role.href}
              className="flex flex-col gap-3 rounded-lg border border-slate bg-panel p-5 transition-colors hover:border-pitch"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-sm bg-panel-raised font-data text-sm text-pitch"
              >
                {role.code}
              </span>
              <span className="font-display text-lg text-chalk">{role.title}</span>
              <span className="font-body text-sm text-chalk-muted">{role.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="coverage-heading" className="flex flex-col gap-6">
        <h2 id="coverage-heading" className="font-display text-xl text-chalk">
          Problem statement coverage
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-slate bg-panel-raised text-chalk-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  Improvement area
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Handled in
                </th>
              </tr>
            </thead>
            <tbody>
              {AREAS.map((row) => (
                <tr key={row.area} className="border-b border-slate last:border-b-0">
                  <td className="px-4 py-3 text-chalk">{row.area}</td>
                  <td className="px-4 py-3">
                    <Link href={row.href} className="text-pitch hover:underline">
                      {row.mode} mode
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
