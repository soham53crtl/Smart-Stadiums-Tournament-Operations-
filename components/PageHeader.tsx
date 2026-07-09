// components/PageHeader.tsx
// The "MODE LABEL / Title / description" block at the top of every role
// page followed the same structure with only the accent color and copy
// differing. Extracted here so that structure lives in exactly one place.

interface PageHeaderProps {
  eyebrow: string;
  eyebrowColor: "text-pitch" | "text-signal";
  title: string;
  description?: string;
}

export default function PageHeader({ eyebrow, eyebrowColor, title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className={`font-data text-xs tracking-widest ${eyebrowColor}`}>{eyebrow}</p>
      <h1 className="font-display text-3xl text-chalk">{title}</h1>
      {description && <p className="font-body text-sm text-chalk-muted">{description}</p>}
    </div>
  );
}
