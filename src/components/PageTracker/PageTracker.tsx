import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { ANALYTICS_PAGE_TITLES } from '../../constants'

/**
 * Reports route changes to Google Analytics. Renders nothing, and must be
 * mounted inside the router.
 *
 * The browser only performs one real document load in a single page app, so the
 * gtag snippet in `index.html` sets `send_page_view: false` and leaves page
 * views to this component, which sends one on mount and one per route change.
 *
 * The effect depends on `pathname` alone. MapContainer keeps its state in the
 * query string and rewrites it through the History API on every layer toggle,
 * so depending on `search` too would send a page view per interaction and split
 * the GA4 Pages report into one row per layer permutation.
 *
 * Only `page_title` is passed. gtag derives location and path from the live URL,
 * which keeps campaign parameters such as `utm_source` intact.
 */
const PageTracker = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Absent outside production builds, see src/types/gtag.d.ts
    if (typeof window.gtag !== 'function') {
      return
    }

    window.gtag('event', 'page_view', {
      page_title: ANALYTICS_PAGE_TITLES[pathname] ?? pathname,
    })
  }, [pathname])

  return null
}

export default PageTracker
