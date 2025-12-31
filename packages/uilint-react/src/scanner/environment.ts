/**
 * Detects whether we're running in a browser or Node.js/JSDOM environment
 */
export function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.fetch !== 'undefined' &&
    // Check if we're NOT in JSDOM
    !isJSDOM()
  );
}

export function isJSDOM(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.navigator.userAgent.includes('jsdom') ||
    // Additional check for test environments
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV === 'test'
  );
}

export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

export function getEnvironment(): 'browser' | 'jsdom' | 'node' {
  if (isBrowser()) return 'browser';
  if (isJSDOM()) return 'jsdom';
  return 'node';
}

