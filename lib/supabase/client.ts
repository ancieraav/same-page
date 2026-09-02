"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { SamePageError } from "@/lib/samepage/errors";
import type { Database } from "./database.types";

type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

let client: SupabaseClient<Database> | null = null;
let configPromise: Promise<SupabaseConfig> | null = null;
let anonymousSignInPromise: Promise<User> | null = null;

async function loadConfig(): Promise<SupabaseConfig> {
  const runtimeEnv = import.meta.env as unknown as Record<string, string | undefined>;
  const configuredUrl = runtimeEnv.VITE_SUPABASE_URL;
  const configuredKey = runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (configuredUrl && configuredKey) {
    return { url: configuredUrl, publishableKey: configuredKey };
  }

  const response = await fetch("/api/config", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new SamePageError(
      "CONFIG_MISSING",
      "Supabase is not configured for this deployment yet.",
    );
  }

  const payload = (await response.json()) as Partial<SupabaseConfig>;
  if (!payload.url || !payload.publishableKey) {
    throw new SamePageError(
      "CONFIG_MISSING",
      "Supabase is not configured for this deployment yet.",
    );
  }

  return { url: payload.url, publishableKey: payload.publishableKey };
}

async function getConfig(): Promise<SupabaseConfig> {
  configPromise ??= loadConfig();
  return configPromise;
}

export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  if (client) return client;

  const config = await getConfig();
  client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export async function ensureSupabaseUser(): Promise<User> {
  const supabase = await getSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (session?.user) return session.user;
  if (anonymousSignInPromise) return anonymousSignInPromise;

  anonymousSignInPromise = supabase.auth
    .signInAnonymously()
    .then(({ data, error }) => {
      if (error || !data.user) {
        throw error ?? new SamePageError("AUTH_REQUIRED", "Unable to create a participant session.");
      }
      return data.user;
    })
    .finally(() => {
      anonymousSignInPromise = null;
    });

  return anonymousSignInPromise;
}

export async function getSupabaseAccessToken(): Promise<string> {
  await ensureSupabaseUser();
  const supabase = await getSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw error ?? new SamePageError("AUTH_REQUIRED", "Your participant session expired.");
  }

  return session.access_token;
}

export function getSupabaseError(error: unknown): SamePageError {
  if (error instanceof SamePageError) return error;

  const candidate = error as { code?: string; message?: string } | null;
  const message = candidate?.message ?? "Supabase request failed.";
  const knownCode = [
    "ROOM_NOT_FOUND",
    "ROOM_FULL",
    "ROOM_STARTED",
    "ROOM_NOT_READY",
    "OPERATOR_REQUIRED",
    "JOIN_LINK_REQUIRED",
    "INVALID_ROLE",
    "STALE_QUESTION",
    "RESPONSE_REQUIRED",
    "RESPONSE_NOT_ALLOWED",
    "OPERATOR_CONTROLS_REQUIRED",
    "ROOM_NOT_ACTIVE",
  ].find((code) => message.includes(code));

  return new SamePageError(knownCode ?? candidate?.code ?? "SUPABASE_ERROR", message);
}
