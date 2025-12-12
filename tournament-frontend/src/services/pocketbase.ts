import PocketBase from 'pocketbase';

// Use environment variable for production, fallback to temporary tunnel URL
// NOTE: Please override via VITE_POCKETBASE_URL in production.
const POCKETBASE_URL =
  (import.meta.env.VITE_POCKETBASE_URL as string | undefined)?.trim() ||
  'https://litigation-sophisticated-portrait-actor.trycloudflare.com';

// Initialize PocketBase client
const pb = new PocketBase(POCKETBASE_URL);

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Log the PocketBase URL for debugging
console.log('PocketBase URL:', POCKETBASE_URL);

export default pb;
