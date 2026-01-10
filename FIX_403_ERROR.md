# 🔧 Fix 403 Forbidden Error - PocketBase API Rules

## ❌ Error Message

```
GET https://pocketbase-railway-production-d9aa.up.railway.app/api/collections/tournaments/records 403 (Forbidden)
Error: Only superusers can perform this action.
```

## 🔍 Problem

Your PocketBase instance on Railway has API rules that are too restrictive. The collections require superuser/admin access when they should allow public read access for listing and viewing records.

## ✅ Solution

You have **3 options** to fix this:

---

## 🚀 Option 1: Use the HTML Fix Tool (Recommended - Easiest)

1. **Open the fix tool:**
   ```bash
   open fix-pocketbase-api-rules.html
   ```
   Or navigate to: `file:///Users/mac/Downloads/bianluns(9.5:10)/fix-pocketbase-api-rules.html`

2. **Follow the step-by-step instructions** in the HTML file to:
   - Open your PocketBase admin dashboard
   - Update API rules for each collection
   - Verify the fix

**This is the safest and most visual method.**

---

## ⚡ Option 2: Use the Automated Script

1. **Make sure you have Node.js installed**

2. **Run the fix script:**
   ```bash
   node fix-api-rules.js [POCKETBASE_URL] [ADMIN_EMAIL] [ADMIN_PASSWORD]
   ```

   Example:
   ```bash
   node fix-api-rules.js https://pocketbase-railway-production-d9aa.up.railway.app admin@example.com yourpassword
   ```

3. **The script will:**
   - Login to your PocketBase instance
   - Find all collections that need fixing
   - Update their API rules automatically
   - Show you a summary of what was updated

**Note:** You need your PocketBase admin email and password for this method.

---

## 📝 Option 3: Manual Fix (Step-by-Step)

### Step 1: Open PocketBase Admin

1. Go to: `https://pocketbase-railway-production-d9aa.up.railway.app/_/`
2. Login with your admin credentials

### Step 2: Fix Each Collection

For **each** of these collections, follow these steps:

- tournaments
- topics
- timer_projects
- judges
- matches
- circuits
- circuit_matches
- registrations
- team_members
- judge_assignments
- judge_scores
- form_configs
- ratings
- resources
- timers

**For each collection:**

1. Click on the collection name in the left sidebar
2. Click the **"API Rules"** tab
3. Set the rules as follows:

| Rule Type | Value | Description |
|-----------|-------|-------------|
| **List/Search rule** | *(leave empty)* | Allows public read access |
| **View rule** | *(leave empty)* | Allows public read access |
| **Create rule** | `@request.auth.id != ""` | Only authenticated users |
| **Update rule** | `@request.auth.id != ""` | Only authenticated users |
| **Delete rule** | `@request.auth.id != ""` | Only authenticated users |

4. Click **"Save changes"**

### Step 3: Priority Collections

If you're short on time, fix these **critical collections first**:

1. ✅ **tournaments** - Required for tournament listings
2. ✅ **topics** - Required for debate topics
3. ✅ **registrations** - Required for tournament registration
4. ✅ **judges** - Required for judge listings

---

## 🎯 Quick Reference: API Rules

### Public Read Access (List/View)
```
Leave empty or set to: ""
```
This allows anyone (including unauthenticated users) to list and view records.

### Authenticated Users Only (Create/Update/Delete)
```
@request.auth.id != ""
```
This requires the user to be logged in.

### Owner Only (Update/Delete own records)
```
@request.auth.id = id
```
This allows users to only modify their own records.

---

## ✅ Verify the Fix

After updating the rules:

1. **Refresh your frontend application** (Ctrl+F5 or Cmd+Shift+R)
2. **Check the browser console** - the 403 error should be gone
3. **Test the functionality:**
   - Tournaments should load
   - You should be able to view tournament details
   - Topics should display
   - Other public data should be accessible

---

## 🔍 Troubleshooting

### Still seeing 403 errors?

1. **Double-check the rules:**
   - List/View rules must be **completely empty** (no spaces, no text)
   - Make sure you clicked "Save changes" for each collection

2. **Clear browser cache:**
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

3. **Check CORS settings:**
   - Make sure your Railway PocketBase instance allows requests from your frontend domain

4. **Verify you're updating the right instance:**
   - Make sure you're logged into the Railway PocketBase admin, not a local instance

5. **Check collection names:**
   - Collection names are case-sensitive
   - Make sure you're updating `tournaments` (lowercase), not `Tournaments`

---

## 📚 Understanding API Rules

### Why List/View should be empty?

Your frontend needs to display tournaments and other data **before** users log in. If List/View rules require authentication, unauthenticated users won't be able to see any data.

### Why Create/Update/Delete require auth?

To prevent unauthorized modifications, only logged-in users should be able to create, update, or delete records.

### Security Note

Allowing public read access is safe for public-facing data like tournaments, topics, and judges. The data is meant to be public anyway. Only write operations (create/update/delete) are protected.

---

## 🆘 Need Help?

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your PocketBase instance is running and accessible
3. Make sure your frontend is pointing to the correct PocketBase URL
4. Review the HTML fix tool for detailed visual instructions

---

## 📋 Collections Checklist

Use this checklist to track which collections you've fixed:

- [ ] tournaments
- [ ] topics
- [ ] timer_projects
- [ ] judges
- [ ] matches
- [ ] circuits
- [ ] circuit_matches
- [ ] registrations
- [ ] team_members
- [ ] judge_assignments
- [ ] judge_scores
- [ ] form_configs
- [ ] ratings
- [ ] resources
- [ ] timers

---

**Last Updated:** 2025-01-08
**PocketBase URL:** https://pocketbase-railway-production-d9aa.up.railway.app

