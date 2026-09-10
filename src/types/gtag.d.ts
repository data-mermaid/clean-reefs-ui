/**
 * Ambient typings for the Google Analytics 4 `gtag.js` global.
 *
 * `window.gtag` is installed by the inline snippet in `index.html`, which only
 * runs when `VITE_ENVIRONMENT` is `production`. It is optional because in local,
 * dev, test, and Storybook builds it is undefined, so call sites must guard with
 * a `typeof window.gtag === 'function'` check.
 *
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference
 */
declare global {
  interface Window {
    /** Narrowed to the one command the app sends. The js and config calls live in index.html, which tsc does not check. */
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void
  }
}

export {}
