type RuntimeBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
};

const RUNTIME_ENV_KEY = "__SAMEPAGE_RUNTIME_ENV__";

export function setRuntimeEnv(bindings: RuntimeBindings) {
  (globalThis as unknown as Record<string, unknown>)[RUNTIME_ENV_KEY] = bindings;
}

export function getRuntimeEnv(): RuntimeBindings {
  return ((globalThis as unknown as Record<string, unknown>)[RUNTIME_ENV_KEY] ?? {}) as RuntimeBindings;
}
