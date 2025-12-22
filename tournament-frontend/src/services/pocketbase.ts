import PocketBase from 'pocketbase';

// Use environment variable for production, fallback to local development
// NOTE: For production, set VITE_POCKETBASE_URL to your deployed backend URL
const POCKETBASE_URL =
  (import.meta.env.VITE_POCKETBASE_URL as string | undefined)?.trim() ||
  'http://127.0.0.1:8090'; // Local development fallback

// Initialize PocketBase client
const pb = new PocketBase(POCKETBASE_URL);

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Log the PocketBase URL for debugging
console.log('PocketBase URL:', POCKETBASE_URL);

export default pb;
