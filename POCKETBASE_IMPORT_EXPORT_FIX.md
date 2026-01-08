# PocketBase Import/Export Fix

## Problem Description

The import/export functionality in the PocketBase admin interface at `https://pocketbase-railway-production-d9aa.up.railway.app/_/#/settings/import-collections` is not working properly. Users encounter "Failed to load the submitted data due to invalid formatting" errors when trying to import collections.

## Root Cause

The exported JSON files contain fields that shouldn't be included in import operations:
- System-generated timestamps (`created`, `updated`)
- Read-only fields that are auto-generated
- Fields that conflict with the API expectations

## Solutions

### Solution 1: Use Migration-Based Collection Recreation (Recommended)

Instead of using the admin interface import/export, use PocketBase's migration system which is the proper way to manage schema changes.

1. **Create a migration file** that recreates all your collections
2. **Run the migration** to recreate the schema
3. **Import your data** separately if needed

The migration file `1766400000_recreate_all_collections.js` has been created for this purpose.

### Solution 2: Manual Collection Creation

Use the HTML setup tool to manually create collections through the admin interface:

```bash
# Open the setup tool
open create-all-collections.html
```

This provides step-by-step instructions for creating each collection manually.

### Solution 3: Clean JSON Import

If you must use the admin interface import, ensure your JSON file only contains the essential fields:

```json
{
  "name": "collection_name",
  "type": "base",
  "system": false,
  "schema": [...],
  "indexes": [],
  "listRule": "...",
  "viewRule": "...",
  "createRule": "...",
  "updateRule": "...",
  "deleteRule": "...",
  "options": {}
}
```

Remove any `id`, `created`, `updated`, or other system fields.

## How to Apply the Fix

### For Local Development

1. **Stop PocketBase** if it's running
2. **Run the migration**:
   ```bash
   cd pocketbase
   ./pocketbase migrate
   ```
3. **Start PocketBase**:
   ```bash
   ./pocketbase serve
   ```

### For Railway Deployment

1. **Commit and push** the migration file to your repository
2. **Redeploy** your Railway app (it will automatically run migrations)
3. **Verify** that collections are created properly

## Alternative: Programmatic Import Script

A Node.js script `import-collections.js` has been created that attempts to import collections via the API. However, due to the formatting issues, the migration approach is preferred.

## Testing the Fix

1. **Access the admin interface** at `http://127.0.0.1:8090/_/` (local) or your Railway URL
2. **Login** with admin credentials
3. **Check Collections** - you should see all collections recreated
4. **Test CRUD operations** on each collection

## Prevention

To avoid this issue in the future:

1. **Use migrations** for schema changes instead of import/export
2. **Keep backups** of your migration files
3. **Test imports** on a separate instance first
4. **Use version control** for your PocketBase configuration

## Troubleshooting

### Migration Fails
- Check PocketBase logs: `tail -f pocketbase/pocketbase.log`
- Ensure migration file syntax is correct
- Verify PocketBase version compatibility

### Collections Not Created
- Run migrations manually: `./pocketbase migrate`
- Check migration order (timestamps matter)
- Verify collection names don't conflict

### Admin Interface Still Broken
- The admin interface import/export may have bugs in certain versions
- Use the migration approach as a reliable alternative
- Consider updating PocketBase to the latest version

## Files Created/Modified

- `pocketbase/pb_migrations/1766400000_recreate_all_collections.js` - Migration to recreate all collections
- `import-collections.js` - Programmatic import script (for reference)
- `POCKETBASE_IMPORT_EXPORT_FIX.md` - This documentation

## Next Steps

1. Apply the migration fix
2. Test that all collections work properly
3. Import any necessary data
4. Update your deployment
5. Consider implementing proper backup strategies
