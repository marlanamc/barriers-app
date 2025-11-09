
# TODO: Implement "Internal Weather" morning flow (Barrier Companion App v2)

## 1. Schema updates (Supabase)
- [x] In `checkins` table, add new columns:
  - `internal_weather` (text) → e.g. "sunny", "cloudy", "rainy", "stormy", "quiet"
  - `weather_icon` (text) → store emoji like ☀️ or 🌧
  - `forecast_note` (text) → optional reflection ("mentally foggy", "overstimulated")
- [x] Migrate DB and update Supabase types in `/lib/database.types.ts`.

## 2. UI updates
### HomeScreen.tsx
- [x] Replace old mood slider with **InternalWeatherSelector** component.
- [x] Prompt text: `"What's the weather inside today?"`
- [x] Cards for five options:
  - ☀️ Clear — Focused, light, steady
  - 🌤 Cloudy — A bit foggy but okay
  - 🌧 Rainy — Heavy, slow, hard to get going
  - 🌪 Stormy — Overwhelmed, scattered, tense
  - 🌙 Quiet — Detached, tired, low input
- [x] Optional text input below: `"Want to describe the forecast?"`
- [x] Button → `"Next: What Matters Today"` navigates to FocusScreen.

### Components/InternalWeatherSelector.tsx
- [x] Horizontal scroll list of cards.
- [x] Each card shows icon, label, short description.
- [x] Selected card uses accent border + subtle shadow.
- [x] Emits `{weather, icon}` via prop callback to parent.

### FocusScreen.tsx
- [x] Keep “What matters today?” prompt.
- [x] Up to 3 focus items (text input + category tags).
- [x] Button → `"Next: What Feels Hard?"` navigates to BarrierScreen.

### BarrierScreen.tsx
- [x] For each focus item, allow user to add a barrier string.
- [x] Optional dropdown of common barriers from `barrier_types`.
- [x] Store barriers temporarily in local state to be saved with checkin.

### GentleSupportScreen.tsx
- [x] Display each focus + barrier with one gentle message pulled from `tips` table.
- [x] “Save Check-in” button writes to:
  - `checkins` (with internal_weather, icon, forecast_note)
  - `focus_items` (per entry)
  - `focus_barriers` (link to `barrier_types` or custom text)

### CalendarScreen.tsx
- [x] Show daily weather icon beside each date.
- [x] On tap → modal showing focus items, barriers, forecast note.

### PatternsScreen.tsx
- [x] Add summary card: `"Most common internal weather this week"` with icon.
- [x] Optional small chart (count of each weather type).

## 3. Data flow
- [x] Use Supabase JS client to insert checkin + related focus items/barriers inside a single transaction.
- [x] Query pattern stats grouped by `internal_weather`.

## 4. Styling
- [x] Keep soft gradient background (lavender → aqua).
- [x] Use Tailwind rounded cards (rounded-2xl, shadow-sm).
- [x] Font: "Inter" or "Nunito".
- [ ] Gentle fade transitions between steps.

## 5. Example Supabase insert
```ts
await supabase.from('checkins').insert({
  user_id: user.id,
  internal_weather: selectedWeather.label,
  weather_icon: selectedWeather.icon,
  forecast_note: forecastText,
  created_at: new Date()
});
````

## 6. Navigation order

HomeScreen → FocusScreen → BarrierScreen → GentleSupportScreen → CalendarScreen → PatternsScreen ✅

## 7. Testing

* [ ] Confirm insertion of new fields.
* [ ] Confirm retrieval for calendar + patterns.
* [ ] Validate UX on mobile layout (Expo or web PWA).


---
