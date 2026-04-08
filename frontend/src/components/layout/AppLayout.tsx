import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

/** Routes that show the bottom tab bar (exact paths only) */
const TAB_ROUTES = new Set(['/home', '/explore', '/events', '/messages', '/profile']);

/** Check if pathname should show bottom nav */
function shouldShowNav(pathname: string): boolean {
  // Exact match for tab routes
  if (TAB_ROUTES.has(pathname)) return true;
  // Also show nav for /events/:id (event detail pages)
  if (/^\/events\/[^/]+$/.test(pathname)) return true;
  // Don't show nav for nested routes like /messages/:id, /users/:id, /profile/edit, etc.
  return false;
}

export function AppLayout() {
  const { pathname } = useLocation();
  const showNav = shouldShowNav(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className={showNav ? 'flex-1 pb-20' : 'flex-1'}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
