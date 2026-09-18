// Vercel serverless entry point.
//
// The repository previously shipped a `vercel.json` that rewrote *every* path
// (including /api/*) to index.html, so the API silently answered with HTML and
// the client's JSON checks always failed. Mounting the same Express app here
// keeps the deployed API and the self-hosted server in sync.
import app from '../server';

export default app;
