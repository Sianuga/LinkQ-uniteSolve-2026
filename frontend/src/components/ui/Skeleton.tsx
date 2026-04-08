interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  className?: string;
}

export function Skeleton({
  width,
  height,
  circle = false,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={[
        'bg-border animate-pulse',
        circle ? 'rounded-full' : 'rounded-[var(--radius-sm)]',
        className,
      ].join(' ')}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...(circle && !width && !height
          ? { width: 40, height: 40 }
          : {}),
      }}
      aria-hidden="true"
    />
  );
}
