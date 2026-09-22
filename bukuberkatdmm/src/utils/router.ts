import { useState, useEffect } from 'react';

export type AppRoute = 'store' | 'admin' | 'track';

export interface RouteState {
  route: AppRoute;
  path: string;
  trackingCode?: string;
}

/**
 * Determine current route from window location pathname or hash
 */
export const parseCurrentRoute = (): RouteState => {
  if (typeof window === 'undefined') {
    return { route: 'store', path: '/' };
  }

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  // Check /admin or #/admin
  if (pathname === '/admin' || pathname.startsWith('/admin/') || hash === '#/admin' || hash === '#admin') {
    return { route: 'admin', path: '/admin' };
  }

  // Check /track or #/track
  if (pathname === '/track' || pathname.startsWith('/track/') || hash === '#/track' || hash === '#track') {
    const code = searchParams.get('code') || searchParams.get('resi') || undefined;
    return { route: 'track', path: '/track', trackingCode: code };
  }

  return { route: 'store', path: '/' };
};

/**
 * Navigate to a specific route using HTML5 History API & Custom Events
 */
export const navigateTo = (route: AppRoute, params?: { trackingCode?: string }): void => {
  if (typeof window === 'undefined') return;

  let targetUrl = '/';
  if (route === 'admin') {
    targetUrl = '/admin';
  } else if (route === 'track') {
    targetUrl = params?.trackingCode ? `/track?code=${encodeURIComponent(params.trackingCode)}` : '/track';
  } else {
    targetUrl = '/';
  }

  // Update browser URL without full page reload
  try {
    window.history.pushState({ route, params }, '', targetUrl);
  } catch (err) {
    // Fallback for strict iframe origins if pushState is restricted
    if (route === 'admin') window.location.hash = '#/admin';
    else if (route === 'track') window.location.hash = params?.trackingCode ? `#/track?code=${encodeURIComponent(params.trackingCode)}` : '#/track';
    else window.location.hash = '';
  }

  // Dispatch global synthetic event for instant React updates
  window.dispatchEvent(new CustomEvent('app:navigation', { detail: { route, params, path: targetUrl } }));
};

/**
 * React Hook to subscribe to Route changes
 */
export const useRoute = () => {
  const [routeState, setRouteState] = useState<RouteState>(() => parseCurrentRoute());

  useEffect(() => {
    const handleLocationChange = () => {
      setRouteState(parseCurrentRoute());
    };

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ route: AppRoute; params?: { trackingCode?: string }; path: string }>;
      if (customEvent.detail) {
        setRouteState({
          route: customEvent.detail.route,
          path: customEvent.detail.path,
          trackingCode: customEvent.detail.params?.trackingCode,
        });
      } else {
        setRouteState(parseCurrentRoute());
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('app:navigation', handleCustomNav);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('app:navigation', handleCustomNav);
    };
  }, []);

  return {
    ...routeState,
    navigate: navigateTo,
  };
};
