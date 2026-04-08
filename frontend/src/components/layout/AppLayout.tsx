import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

/** Routes that show the bottom tab bar */
const TAB_ROUTES = new Set(['/home', '/explore', '/events', '/messages', '/profile']);

export function AppLayout() {
  const { pathname } = useLocation();
  const showNav = TAB_ROUTES.has(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className={showNav ? 'flex-1 pb-16' : 'flex-1'}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
