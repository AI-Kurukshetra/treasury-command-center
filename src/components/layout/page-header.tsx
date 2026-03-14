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
    <div className="space-y-3">
      {eyebrow ? (
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {eyebrow}
        </Badge>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      {meta.length ? (
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
