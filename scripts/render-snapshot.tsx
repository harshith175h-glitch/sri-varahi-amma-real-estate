/**
 * Renders the real application to a standalone, styled HTML snapshot.
 *
 * Useful when no browser is available (CI / sandbox): the React tree is mounted
 * in jsdom, the production CSS is inlined, and the result opens like the page
 * itself. Images and web fonts are fetched from the network by the browser that
 * opens the file, so they appear for anyone with normal internet access.
 *
 * Usage: npx tsx scripts/render-snapshot.tsx [outputPath]
 */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const outPath = process.argv[2] || 'preview-snapshot.html';
const distDir = path.join(process.cwd(), 'dist', 'assets');

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:3000/',
  pretendToBeVisual: true,
});

const w = dom.window as unknown as Record<string, unknown>;

// Minimal browser API shims used across the app.
class MockIndexedDB {} // imageStorage checks for `window.indexedDB` and falls back
const stubs: Record<string, unknown> = {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  CustomEvent: dom.window.CustomEvent,
  MouseEvent: dom.window.MouseEvent,
  KeyboardEvent: dom.window.KeyboardEvent,
  Event: dom.window.Event,
  Node: dom.window.Node,
  localStorage: dom.window.localStorage,
  sessionStorage: dom.window.sessionStorage,
  Image: dom.window.Image,
  requestAnimationFrame: (cb: FrameRequestCallback) => dom.window.setTimeout(() => cb(Date.now()), 0),
  cancelAnimationFrame: (id: number) => dom.window.clearTimeout(id),
  matchMedia: () => ({
    matches: false,
    media: '',
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
  IntersectionObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  indexedDB: new MockIndexedDB(),
  // The Express API is not reachable from jsdom; answer 404 so components use
  // their documented fallbacks instead of hanging.
  fetch: async () => ({
    ok: false,
    status: 404,
    headers: { get: () => 'application/json' },
    json: async () => ({}),
    text: async () => '',
  }),
  scrollTo: () => {},
};

for (const [key, value] of Object.entries(stubs)) {
  Object.defineProperty(global, key, { value, configurable: true, writable: true });
}
(dom.window as unknown as Record<string, unknown>).matchMedia = stubs.matchMedia;
(dom.window as unknown as Record<string, unknown>).IntersectionObserver = stubs.IntersectionObserver;
(dom.window as unknown as Record<string, unknown>).ResizeObserver = stubs.ResizeObserver;
(dom.window as unknown as Record<string, unknown>).scrollTo = stubs.scrollTo;
Object.defineProperty(dom.window, 'indexedDB', { value: new MockIndexedDB(), configurable: true });

const React = (await import('react')).default;
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const App = (await import('../src/App')).default;

const container = dom.window.document.getElementById('root')!;
const root = createRoot(container);

flushSync(() => {
  root.render(React.createElement(App));
});

// let effects (image probes, timers) settle briefly
await new Promise((resolve) => setTimeout(resolve, 1200));

const markup = container.innerHTML;
const cssFile = fs.readdirSync(distDir).find((f) => f.endsWith('.css'));
const css = cssFile ? fs.readFileSync(path.join(distDir, cssFile), 'utf-8') : '';

const html = `<!doctype html>
<html lang="en" class="h-full">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sri Varahi Amma Real Estate — rendered snapshot</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<style>${css}</style>
<style>
  /* static snapshot: keep decorative animation from hiding content */
  * { animation: none !important; }
  .snapshot-banner {
    position: sticky; top: 0; z-index: 9999; background: #171513; color: #D4AF37;
    font: 600 12px/1.4 'Plus Jakarta Sans', system-ui, sans-serif; padding: 8px 14px; text-align: center;
    letter-spacing: .04em;
  }
</style>
</head>
<body class="h-full bg-[#FCFAF7] text-[#1A1A1A] antialiased">
<div class="snapshot-banner">
  Static render of the live site (${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC) ·
  interactive version: npm run dev → preview panel on port 3000
</div>
${markup}
</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf-8');
console.log(`✅ wrote ${outPath} (${(html.length / 1024).toFixed(0)} kB, css ${(css.length / 1024).toFixed(0)} kB)`);
console.log(`   sections rendered: header=${markup.includes('Sri Varahi Amma')} listings=${markup.includes('id="listings-catalog"')} footer=${markup.includes('bg-[#FAF8F5]')}`);
process.exit(0);
