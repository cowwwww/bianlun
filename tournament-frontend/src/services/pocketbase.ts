import PocketBase from 'pocketbase';

// Use environment variable for production, fallback to Railway deployment
// NOTE: For local development, set VITE_POCKETBASE_URL=http://127.0.0.1:8090
const POCKETBASE_URL =
  (import.meta.env.VITE_POCKETBASE_URL as string | undefined)?.trim() ||
  'https://bianlun-production.up.railway.app'; // Railway deployment

// Initialize PocketBase client
const pb = new PocketBase(POCKETBASE_URL);

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Log the PocketBase URL for debugging
console.log('PocketBase URL:', POCKETBASE_URL);

export default pb;
