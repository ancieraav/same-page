import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Returns true if the application has UI debug mode enabled.
 * Driven by the NEXT_PUBLIC_DEBUG_MODE environment variable or .env file.
 */
export function isDebugMode(): boolean {
  const envVal = process.env['NEXT_PUBLIC_DEBUG_MODE'];
  if (envVal !== undefined) {
    return envVal === 'true';
  }
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (/^NEXT_PUBLIC_DEBUG_MODE\s*=\s*true/m.test(content)) {
        return true;
      }
    }
  } catch {
    // Non-filesystem or client environments
  }
  return false;
}

/**
 * Throws a Next.js 404 notFound error when debug mode is disabled.
 * Used in server components and layout guards for /debug routes.
 */
export function assertDebugMode(): void {
  if (!isDebugMode()) {
    notFound();
  }
}
