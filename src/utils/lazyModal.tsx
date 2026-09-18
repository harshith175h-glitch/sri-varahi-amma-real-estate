import React, { Suspense } from 'react';

/**
 * Creates a lazily-loaded modal component.
 *
 * The site shipped as a single 615 kB JavaScript chunk (159 kB gzipped) that
 * included every modal — document wallet, escrow tracker, listing wizard, guide
 * — even though a visitor rarely opens more than one. Splitting them keeps the
 * first paint light, and the component only downloads when its `isOpen` /
 * `property` guard becomes truthy in App.tsx.
 *
 * The component keeps the exact same props as the original export; a null
 * fallback is used because every modal already renders its own overlay.
 */
export function lazyModal<P extends object>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string
): React.ComponentType<P> {
  const LazyComponent = React.lazy(async () => {
    const mod = await factory();
    const resolved = (mod[exportName] ?? mod.default) as React.ComponentType<P>;
    return { default: resolved };
  });

  const Wrapped: React.FC<P> = (props) => (
    <Suspense fallback={null}>
      <LazyComponent {...props} />
    </Suspense>
  );

  Wrapped.displayName = `Lazy(${exportName})`;
  return Wrapped;
}
