"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ModuleField } from "@/types/modules";

type ModuleRecordFormProps = {
  slug: string;
  fields: ModuleField[];
};

export function ModuleRecordForm({ slug, fields }: ModuleRecordFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setSuccess(null);

    const payload = Object.fromEntries(formData.entries());
    const createdLabel = fields
      .map((field) => payload[field.name])
      .find((value) => typeof value === "string" && value.trim().length > 0);

    const response = await fetch(`/api/modules/${slug}/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(Array.isArray(data.issues) ? data.issues.join(" ") : data.error ?? "Request failed.");
      setPending(false);
      return;
    }

    setSuccess(
      typeof createdLabel === "string" ? `Record created. ${createdLabel}` : "Record created."
    );
    formRef.current?.reset();
    router.refresh();
    setPending(false);
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="space-y-5 rounded-[1.8rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_60px_rgba(17,30,64,0.08)]"
    >
      <div>
        <h3 className="font-display text-2xl font-semibold">Create module record</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Submit a validated sample record for this module.
        </p>
      </div>

      {fields.map((field) => (
        <label key={field.name} className="grid gap-2 text-sm">
          <span className="font-medium">{field.label}</span>
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              required
              placeholder={field.placeholder}
              className="min-h-28 rounded-2xl border border-input/80 bg-white/80 px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : field.type === "select" ? (
            <select
              name={field.name}
              required
              defaultValue=""
              className="h-11 rounded-2xl border border-input/80 bg-white/80 px-4 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>
                Select {field.label.toLowerCase()}
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type}
              required
              step={field.step}
              placeholder={field.placeholder}
              className="h-11 rounded-2xl border border-input/80 bg-white/80 px-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}
        </label>
      ))}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating..." : "Create record"}
      </Button>
    </form>
  );
}
