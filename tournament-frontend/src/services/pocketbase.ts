import PocketBase from 'pocketbase';

// Use environment variable for production, fallback to Railway backend
// NOTE: Update this URL with your Vercel/Railway/other backend URL for China access
const POCKETBASE_URL =
  (import.meta.env.VITE_POCKETBASE_URL as string | undefined)?.trim() ||
  'https://bianluns-api.up.railway.app'; // Replace with your China-accessible backend URL

// Initialize PocketBase client
const pb = new PocketBase(POCKETBASE_URL);

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Log the PocketBase URL for debugging
console.log('PocketBase URL:', POCKETBASE_URL);

export default pb;
