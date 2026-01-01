/**
 * Environment detection utilities
 */

/**
 * Checks if we're running in a browser environment
 */
export function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
}

/**
 * Checks if we're running in a JSDOM environment (tests)
 */
export function isJSDOM(): boolean {
  if (!isBrowser()) return false;

  const userAgent = window.navigator?.userAgent || "";
  return userAgent.includes("jsdom");
}

/**
 * Checks if we're running in Node.js
 */
export function isNode(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  );
}
