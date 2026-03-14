import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: string[];
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta = []
}: PageHeaderProps) {
  return (
    <div className="space-y-5 rounded-[2rem] border border-white/70 bg-white/70 p-7 shadow-[0_28px_70px_rgba(17,30,64,0.08)]">
      {eyebrow ? (
        <Badge variant="secondary" className="w-fit">
          {eyebrow}
        </Badge>
      ) : null}
      <div className="space-y-3">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      {meta.length ? (
        <div className="flex flex-wrap gap-2">
          {meta.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
