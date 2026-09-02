function getRuntimeValue(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const processEnv = process.env as Record<string, string | undefined>;
  if (processEnv[name]) return processEnv[name];
  const buildEnv = import.meta.env as unknown as Record<string, string | undefined>;
  const publicAlias = name === "SUPABASE_URL" ? "VITE_SUPABASE_URL" : name === "SUPABASE_PUBLISHABLE_KEY" ? "VITE_SUPABASE_PUBLISHABLE_KEY" : name;
  return buildEnv[publicAlias];
}

export async function GET() {
  const url = getRuntimeValue("SUPABASE_URL");
  const publishableKey = getRuntimeValue("SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey) {
    return Response.json(
      { error: "Supabase runtime configuration is missing." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { url, publishableKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
