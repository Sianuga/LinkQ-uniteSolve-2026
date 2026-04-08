import { useLocation } from 'react-router-dom';

/**
 * Factory that creates a placeholder page component for a given screen.
 * Each placeholder shows the screen name and current route so the layout
 * and routing can be verified before real pages are built.
 */
export function createPlaceholder(screenName: string) {
  function PlaceholderPage() {
    const { pathname } = useLocation();

    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="text-3xl font-bold text-primary">{screenName}</span>
        <span className="rounded-full bg-highlight px-3 py-1 font-mono text-xs text-text-secondary">
          {pathname}
        </span>
        <p className="mt-2 max-w-xs text-sm text-text-secondary">
          This is a placeholder. The real page will be built by another agent.
        </p>
      </div>
    );
  }

  PlaceholderPage.displayName = screenName;
  return PlaceholderPage;
}
