type SectionEmptyProps = {
  title: string;
  description: string;
};

export function SectionEmpty({ title, description }: SectionEmptyProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
