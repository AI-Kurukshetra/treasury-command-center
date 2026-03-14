"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type IntegrationSyncButtonProps = {
  connectionId: string;
  providerName: string;
  syncType: string;
};

export function IntegrationSyncButton({
  connectionId,
  providerName,
  syncType
}: IntegrationSyncButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSync() {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/integrations/sync", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        integrationConnectionId: connectionId,
        syncType
      })
    });

    const body = (await response.json()) as { summary?: string; error?: string };

    if (!response.ok) {
      setPending(false);
      setMessage(body.error ?? "Sync failed.");
      return;
    }

    setPending(false);
    setMessage(body.summary ?? `${providerName} sync completed.`);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={handleSync} disabled={pending}>
        {pending ? "Syncing..." : "Run sync"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
