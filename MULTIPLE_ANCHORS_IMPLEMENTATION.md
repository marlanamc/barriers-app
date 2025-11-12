# Multiple Anchors Feature Implementation

## Goal
Allow users to combine multiple anchors like "at 3pm while listening to music" or "after lunch before opening email"

## Status: Foundation Complete ✅

### Completed
1. **Database Migration** (`20241224_add_multiple_anchors_support.sql`)
   - Added `anchors` JSONB column to `focus_items` and `planned_items` tables
   - Migrated existing single anchor data to new format
   - Updated `create_checkin_with_focus` function to support both formats
   - Maintains backward compatibility with legacy single anchor fields

2. **TypeScript Types** (`lib/checkin-context.tsx`)
   - Added `TaskAnchor` interface: `{ type: TaskAnchorType; value: string }`
   - Updated `FocusItemState` with `anchors?: TaskAnchor[]` field
   - Added context methods:
     - `setAnchorsForFocusItem(id, anchors)` - Set all anchors at once
     - `addAnchorToFocusItem(id, anchor)` - Add a single anchor
     - `removeAnchorFromFocusItem(id, index)` - Remove an anchor by index
   - Maintains legacy `anchorType` and `anchorValue` for backward compatibility

3. **Helper Functions** (`lib/anchors.ts`)
   - `buildMultipleAnchorsPhrase(anchors)` - Convert anchor array to natural language
   - `buildPhraseWithMultipleAnchors(title, anchors)` - Build complete phrase
   - Examples:
     - `[{type: "at", value: "3pm"}]` → "at 3:00 PM"
     - `[{type: "at", value: "3pm"}, {type: "while", value: "listening to music"}]` → "at 3:00 PM while listening to music"

### Next Steps - UI Implementation

#### Phase 1: Display Multiple Anchors (Recommended First)
Update display components to show multiple anchors:

1. **Homepage** (`app/page.tsx`)
   - Import `buildPhraseWithMultipleAnchors`
   - Change from `anchorValueForDisplay(item.anchorType, item.anchorValue)`
   - To: `buildMultipleAnchorsPhrase(item.anchors || [])`

2. **Calendar Views**
   - Update `app/calendar/page.tsx`
   - Update `app/calendar/[date]/page.tsx`
   - Use `buildMultipleAnchorsPhrase` helper

#### Phase 2: Enable Multiple Anchor Selection
Update barriers page to allow adding multiple anchors:

1. **Barriers Page** (`app/barriers/page.tsx`)
   - Show list of currently added anchors with remove buttons
   - Change "Clear" button to "Add Another Anchor"
   - After selecting an anchor type + value, add it to the list instead of replacing
   - Use `addAnchorToFocusItem` and `removeAnchorFromFocusItem` from context

**Example UI Flow:**
```
Current Anchors:
  [at 3:00 PM] [x]

Add Another:
  [ At ] [ While ] [ Before ] [ After ]

  → User selects "While"
  → Input: "listening to music"
  → Click "Add"

Current Anchors:
  [at 3:00 PM] [x]
  [while listening to music] [x]
```

### Database Schema

#### focus_items / planned_items
```sql
-- New column (JSONB array)
anchors JSONB DEFAULT '[]'::JSONB

-- Example data:
[
  {"type": "at", "value": "15:00"},
  {"type": "while", "value": "listening to music"}
]

-- Legacy columns (kept for backward compatibility)
anchor_type TEXT  -- 'at', 'while', 'before', 'after'
anchor_value TEXT
```

### Backward Compatibility
The system supports both old and new formats:

1. **Reading**: Checks for `anchors` array first, falls back to `anchor_type`/`anchor_value`
2. **Writing**: Always writes to both formats (anchors array + legacy fields)
3. **Migration**: Existing data was automatically converted to new format

### Migration Instructions

1. **Run the database migration**:
   ```sql
   -- Execute in Supabase SQL Editor:
   -- database/migrations/20241224_add_multiple_anchors_support.sql
   ```

2. **Deploy the code changes** (already done):
   - ✅ Types updated
   - ✅ Context functions added
   - ✅ Helper functions created

3. **Update UI components** (Phase 1 - recommended first):
   - Update display logic to use `buildMultipleAnchorsPhrase`
   - This will show existing anchors correctly

4. **Enable editing** (Phase 2 - future enhancement):
   - Update barriers page to allow adding multiple anchors
   - Test the full flow

### Testing Checklist
- [ ] Run database migration
- [ ] Verify existing single anchors still display correctly
- [ ] Create a new check-in with single anchor
- [ ] Update display logic to show `anchors` array
- [ ] Add UI to select multiple anchors
- [ ] Test "at 3pm while listening to music"
- [ ] Test "after lunch before opening email"
- [ ] Verify data saves correctly to database

### Example Usage (when UI is updated)

```typescript
import { useCheckIn } from '@/lib/checkin-context';
import { buildMultipleAnchorsPhrase } from '@/lib/anchors';

// Display anchors
const { focusItems } = useCheckIn();
const item = focusItems[0];
const anchorText = buildMultipleAnchorsPhrase(item.anchors || []);
// "at 3:00 PM while listening to music"

// Add anchor
const { addAnchorToFocusItem } = useCheckIn();
addAnchorToFocusItem(item.id, { type: 'while', value: 'listening to music' });

// Set all anchors
const { setAnchorsForFocusItem } = useCheckIn();
setAnchorsForFocusItem(item.id, [
  { type: 'at', value: '15:00' },
  { type: 'while', value: 'listening to music' }
]);
```
