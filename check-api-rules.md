# Check PocketBase API Rules

The registrations might not be showing because the API rules don't allow public read access.

## Steps to Fix:

1. Go to PocketBase Admin: https://pocketbase-railway-production-d9aa.up.railway.app/_/

2. Navigate to: Collections → registrations → Settings → API Rules

3. Set the **List/Search rule** to:
   ```
   @request.auth.id != "" || @request.auth.id = ""
   ```
   OR simply:
   ```
   true
   ```
   This allows anyone (including unauthenticated users) to read registrations.

4. Set the **View rule** to:
   ```
   @request.auth.id != "" || @request.auth.id = ""
   ```
   OR:
   ```
   true
   ```

5. Click **Save**

6. Refresh the admin dashboard page

## Alternative: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for any errors when loading the admin dashboard. The debugging logs I added will show:
- "Loading registrations for tournament: [id]"
- "Loaded registrations: [count]"
- Any error messages

## Test the API Directly

You can also test if the API is accessible by opening this URL in your browser:
```
https://pocketbase-railway-production-d9aa.up.railway.app/api/collections/registrations/records?filter=tournamentId="go8jpyetsvirzbp"
```

If you see a 403 error, the API rules need to be updated.
If you see the data, then the issue is with the frontend code.
