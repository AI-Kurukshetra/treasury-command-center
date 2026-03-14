import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AppSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
  };
};

export const getAppSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profileData }, { data: membershipData }] = await Promise.all([
    supabase.from("profiles").select("full_name, role_label").eq("id", user.id).maybeSingle(),
    supabase
      .from("organization_memberships")
      .select("organization_id, is_default")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);
  const profile = profileData as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "full_name" | "role_label"
  > | null;
  const membership = membershipData as Pick<
    Database["public"]["Tables"]["organization_memberships"]["Row"],
    "organization_id" | "is_default"
  > | null;

  let organizationName = user.user_metadata.organization_name ?? "Unassigned workspace";

  if (membership?.organization_id) {
    const { data: organizationData } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", membership.organization_id)
      .maybeSingle();
    const organization = organizationData as Pick<
      Database["public"]["Tables"]["organizations"]["Row"],
      "id" | "name"
    > | null;

    if (organization?.name) {
      organizationName = organization.name;
    }
  }

  return {
    user: {
      id: user.id,
      name: profile?.full_name ?? user.user_metadata.full_name ?? user.email ?? "Treasury User",
      email: user.email ?? "",
      role: profile?.role_label ?? user.user_metadata.role ?? "Treasury User"
    },
    organization: {
      id: membership?.organization_id ?? user.user_metadata.organization_id ?? "unassigned",
      name: organizationName
    }
  };
});
