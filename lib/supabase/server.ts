import {
  createClient,
  type User,
} from "@supabase/supabase-js";

import { SamePageError } from "@/lib/samepage/errors";

type RuntimeEnv = Record<string, string | undefined>;

function getRuntimeValue(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const processEnv = process.env as RuntimeEnv;
  if (processEnv[name]) return processEnv[name];
  const buildEnv = import.meta.env as unknown as RuntimeEnv;
  const publicAlias = name === "SUPABASE_URL" ? "VITE_SUPABASE_URL" : name === "SUPABASE_PUBLISHABLE_KEY" ? "VITE_SUPABASE_PUBLISHABLE_KEY" : name;
  return buildEnv[publicAlias];
}

function getSupabaseConfig(): { url: string; publishableKey: string } {
  const url = getRuntimeValue("SUPABASE_URL");
  const publishableKey = getRuntimeValue("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !publishableKey) {
    throw new SamePageError(
      "CONFIG_MISSING",
      "Supabase runtime configuration is missing.",
    );
  }
  return { url, publishableKey };
}

export async function getRequestSupabase(request: Request): Promise<{
  user: User;
  client: ReturnType<typeof createClient>;
}> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new SamePageError("AUTH_REQUIRED", "A participant session is required.");

  const { url, publishableKey } = getSupabaseConfig();
  const client = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    throw new SamePageError("AUTH_REQUIRED", "Your participant session expired.");
  }
  return { user: data.user, client };
}
