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
/** Props of the component exported under `K` from module `M`. */
type PropsOfExport<M, K extends keyof M> = M[K] extends React.ComponentType<infer P>
  ? P extends object
    ? P
    : Record<string, unknown>
  : Record<string, unknown>;

export function lazyModal<M extends Record<string, unknown>, K extends keyof M & string>(
  factory: () => Promise<M>,
  exportName: K
): React.ComponentType<PropsOfExport<M, K>> {
  type P = PropsOfExport<M, K>;

  const LazyComponent = React.lazy(async () => {
    const mod = await factory();
    const resolved = (mod[exportName] ?? mod.default) as React.ComponentType<P>;
    return { default: resolved };
  });

  const Wrapped: React.FC<P> = (props: P) => (
    <Suspense fallback={null}>
      {React.createElement(LazyComponent as React.ComponentType<P>, props)}
    </Suspense>
  );

  Wrapped.displayName = `Lazy(${exportName})`;
  return Wrapped;
}
