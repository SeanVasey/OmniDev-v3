/**
 * Next.js instrumentation file
 * This runs once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on Node.js runtime (not edge)
    const { logConfigurationStatus } = await import('./app/lib/env');
    logConfigurationStatus();
  }
}
