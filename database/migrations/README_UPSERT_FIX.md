# Check-in Upsert Fix (Migration 20241224)

## Problem
When saving a check-in, previous check-ins appeared to be deleted or disappear from the calendar view. This caused user confusion and concern about data loss.

## Root Cause
The issue was in the `create_checkin_with_focus` database function. When updating an existing check-in:

1. It would `DELETE FROM focus_items WHERE checkin_id = existing_checkin_id` (delete ALL items)
2. Then immediately recreate all focus items from scratch
3. During the brief moment between DELETE and INSERT, the check-in appeared empty
4. Calendar queries that JOIN on focus_items would return no results during this window

### Why It Appeared to Affect Previous Days
- The calendar view loads a month's worth of check-ins at once
- If you saved a check-in while viewing the calendar, the database query would run during the DELETE phase
- Any check-ins without focus items (temporarily or permanently) wouldn't show up
- This made it seem like old check-ins were being deleted

## Solution
The new migration (`20241224_fix_focus_items_upsert.sql`) implements intelligent upsert logic:

### What Changed
1. **UPDATE instead of DELETE+INSERT**: Existing focus items are now updated in place
2. **Match by description + sort_order**: Items are matched to determine what to update vs delete vs insert
3. **Selective deletion**: Only items that are truly removed are deleted
4. **Logging**: Added `RAISE NOTICE` statements to track operations (visible in database logs)
5. **Date validation**: Added explicit date validation and logging on client side

### Benefits
- ✅ No data loss window - items are updated atomically
- ✅ Better performance - fewer DELETE/INSERT operations
- ✅ Cleaner history - existing focus_item IDs are preserved when possible
- ✅ Debuggable - logs show exactly what operations occurred

## Migration Safety
- ✅ Backward compatible - same function signature
- ✅ Idempotent - safe to run multiple times
- ✅ No data migration needed - only changes function logic
- ✅ Falls back gracefully - if match fails, it inserts new items

## Testing Checklist
- [ ] Create a check-in for today
- [ ] Verify it shows in calendar
- [ ] Update the check-in (add/remove focus items)
- [ ] Verify calendar doesn't flash/flicker
- [ ] Create check-ins for multiple days
- [ ] Update one day, verify others unchanged
- [ ] Check database logs for NOTICE messages

## Rollback Plan
If issues occur, you can rollback by running the previous version of the function from `20241221_update_checkin_upsert.sql`.

```sql
-- Rollback command (if needed)
-- Run the CREATE OR REPLACE FUNCTION from 20241221_update_checkin_upsert.sql
```

## Monitoring
After deployment, monitor for:
- Check-ins appearing to disappear (should be resolved)
- Database performance (should be improved or neutral)
- Error logs mentioning "focus_items" or "upsert"
- User reports of data loss (should be eliminated)

## Client-Side Changes
Added logging in `lib/supabase.ts` (`saveCheckinWithFocus` function) to log:
- User ID
- Check-in date (provided, normalized, and actual)
- Weather type
- Focus items count

Check browser console for `💾 Saving check-in:` messages to debug date issues.
