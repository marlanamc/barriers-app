# Check-In Flow & Momentum Improvements

## Current Issues (3 areas rated 1/2)

### 1. Starting Check-In ⚠️
**Current Rating:** 1/2  
**Issue:** 
- If energy type is already set, user needs 2 taps (click edit button, then select)
- Button says "Set Energy" - could be more permission-like

**Current Flow:**
- No energy set → Weather section visible → 1 tap to select
- Energy already set → Need to click edit button (RotateCcw icon) → 2 taps total

**Target:** Maximum 2 taps, but ideally 1 tap when possible

**Proposed Solutions:**

**Option A: Make edit button more obvious**
- Add text label: "Change" or "Adjust energy"
- Make button larger/more prominent
- Add visual cue that it's clickable

**Option B: Always show energy selector when tapped**
- When user taps the energy badge, immediately show selector
- No need for separate "edit" mode
- One tap to open, one tap to select = 2 taps total (meets target)

**Option C: Add "Quick adjust" button**
- Add a prominent button below energy badge: "Change energy type"
- More obvious than small icon button

---

### 2. Weather Selection Speed ⚠️
**Current Rating:** 1/2  
**Issue:**
- Carousel auto-selects centered option, but still requires explicit tap to confirm
- User might not realize they need to tap - feels like extra work
- Scrolling is smooth but might feel unnecessary

**Current Behavior:**
- Carousel shows 5 energy types
- Centers on first one (Sparky)
- Auto-selects Sparky on load
- But user still needs to tap to "confirm" selection
- If user scrolls, they need to tap the one they want

**Target:** Intuitive selection - either auto-selects OR requires one clear tap

**Proposed Solutions:**

**Option A: Make auto-selection more obvious**
- Add visual feedback when auto-selected: "Selected: Sparky" text
- Add checkmark or highlight on auto-selected item
- Show "Tap to change" hint

**Option B: Remove need for confirmation tap**
- If auto-selected, it's already selected - no tap needed
- Only require tap if user scrolls to different option
- This makes it truly 1-tap when auto-selected

**Option C: Add "I'm not sure" option**
- Add a 6th option: "Not sure?" that shows guided questions
- Helps users who struggle with interoception
- Questions like: "Can you focus right now?" → guides to appropriate type

**Option D: Simplify to 4 options**
- Reduce from 5 to 4 energy types (remove one, or combine similar ones)
- Less scrolling = less decision fatigue
- Faster selection

---

### 3. Completing Check-In ⚠️
**Current Rating:** 1/2  
**Issue:**
- No celebration/confirmation when saved
- Just moves to forecast screen silently
- No dopamine boost for completing check-in

**Current Behavior:**
- User clicks "Save check-in"
- Shows spinner ("Saving...")
- Then immediately shows Daily Forecast
- No "Saved!" message or celebration

**Target:** Save should feel like an accomplishment with immediate feedback

**Proposed Solutions:**

**Option A: Add success message**
- Show brief "Check-in saved! ✨" message before forecast
- Small animation or emoji
- 1-2 second delay, then show forecast

**Option B: Add celebration animation**
- Brief confetti or checkmark animation
- Satisfying but not over-stimulating
- Then transition to forecast

**Option C: Add encouraging text**
- "Great start! Here's your daily forecast."
- Or "You did it! Your forecast is ready."
- Positive reinforcement

**Option D: Show progress indicator**
- "Check-in saved ✓"
- Brief visual confirmation
- Then "Generating your forecast..." → forecast

---

## Recommended Priority

**High Priority:**
1. **Completing Check-In** - Easiest to fix, biggest impact on dopamine
2. **Starting Check-In** - Make edit button more obvious (Option A or B)

**Medium Priority:**
3. **Weather Selection Speed** - Make auto-selection clearer (Option A or B)

---

## Implementation Notes

### For Starting Check-In:
- The edit button is currently a small icon (RotateCcw)
- Could add text label or make it a full button
- Or make the energy badge itself clickable to edit

### For Weather Selection Speed:
- Auto-selection happens in `InternalWeatherSelector.tsx` line 217
- Currently auto-selects but user might not realize it
- Could add visual indicator or remove confirmation requirement

### For Completing Check-In:
- Save happens in `gentle-support/page.tsx` line 630
- After `setDone(true)`, immediately shows forecast
- Could add intermediate success state

---

## Questions to Consider

1. **Starting Check-In:** Should the energy badge itself be clickable to edit, or keep separate edit button?
2. **Weather Selection:** Should auto-selection be the final selection (no tap needed), or keep confirmation tap?
3. **Completing:** What level of celebration feels right? Subtle checkmark or brief animation?

