
# Feature Update: Add "Task Anchors" and "Daily Forecast Background"

## GOAL
After a user completes their morning check-in (weather → focus items → barriers),
we want to:
1. Let them attach **context or timing** to each focus item ("at 3pm" or "while watching football").
2. Automatically generate a **Daily Forecast background image** summarizing their internal weather, key tasks, and gentle reminder.

---

## 1️⃣ TASK ANCHORS (AT / WHILE)

### Purpose
Help users connect tasks to time or context so actions feel more tangible and less overwhelming.
Also aligns with ESOL-style phrasing: "at ___" (time) and "while ___" (activity).

### UI Behavior
After user adds a focus item and barrier, prompt:

> "When could you do this, or what could you pair it with?"

Provide two choices:
- **At...** → opens a simple time picker (user selects a time, stored as string or ISO time)
- **While...** → opens a small text input or shows common examples:
  - while watching TV
  - while listening to music
  - while waiting for laundry
  - while talking to a friend

Once selected, display the phrase under the task:
> 🧺 Laundry while watching football  
> 💼 Job interview at 3pm

### Data Handling
Each focus item now stores:
- `anchor_type` (text) → either `"at"` or `"while"`
- `anchor_value` (text) → e.g. `"3pm"`, `"watching football"`

Include these when inserting focus items into Supabase.

Example payload:
```ts
await supabase.from('focus_items').insert({
  checkin_id,
  title: 'Laundry',
  barrier: 'Feels too big',
  anchor_type: 'while',
  anchor_value: 'watching football'
});
````

### Display

* On the summary / confirmation screen, render `${title} ${anchor_type} ${anchor_value}`.
* These phrases will later appear on the **Daily Forecast** background.

---

## 2️⃣ DAILY FORECAST BACKGROUND

### Purpose

After the user saves their check-in, generate a calming image that summarizes:

* Their internal weather (emoji + phrase)
* Gentle quote (from your tip bank)
* Focus items + their anchors
  This image can be used as a lock screen background or app wallpaper to keep the day’s priorities visible and emotionally grounding.

### UI Flow

After check-in is saved:

* Show a new screen titled “Your Daily Forecast”
* Render a visual card with:

  * Gradient background based on `internal_weather`
  * Weather icon and headline (“🌧 Rainy Mind Today”)
  * Gentle reminder (“Gentle steps still count.”)
  * List of tasks with anchors (e.g., “💼 Job apps at 3pm”, “🧺 Laundry while watching football”)
  * Buttons:

    * “Save as Image”
    * “Share”
    * “Done”

### Visual Generation

Use a client-side library (like `html2canvas` for web or `react-native-view-shot` for mobile) to capture this JSX layout as an image file.

Each weather type has its own gradient palette:

| Weather   | Gradient            | Accent          |
| --------- | ------------------- | --------------- |
| ☀️ Clear  | `#FFD580 → #FFF9E3` | warm yellow     |
| 🌤 Cloudy | `#CDE3F5 → #F2F2F2` | soft blue       |
| 🌧 Rainy  | `#9CBED7 → #D1E2EA` | muted gray-blue |
| 🌪 Stormy | `#B38DCB → #5D7AA2` | indigo-purple   |
| 🌙 Quiet  | `#B6B6D8 → #E0D5F2` | lavender        |

Fonts: soft sans serif (Inter, Poppins, or Nunito).
Use rounded corners and gentle shadow for any text container.

Example layout pseudocode:

```tsx
<View style={styles.backgroundRainy}>
  <Text style={styles.weatherTitle}>🌧 Rainy Mind Today</Text>
  <Text style={styles.quote}>Gentle steps still count.</Text>
  <View style={styles.taskList}>
    <Text>💼 Job apps at 3pm</Text>
    <Text>🧺 Laundry while watching football</Text>
  </View>
</View>
```

### Export Options

Add buttons for:

* **Save to camera roll / downloads folder** (`expo-media-library` or Web canvas download)
* **Share** via Web Share API or Expo Sharing

Optional: upload generated image to Supabase Storage for future reference.

Optional table:
`daily_forecasts (id, user_id, checkin_id, image_url, created_at)`

---

## Summary

✅ Add anchor fields (`anchor_type`, `anchor_value`) for each task.
✅ Prompt user with “at” or “while” input options.
✅ After saving check-in, generate a soft visual summary image (“Daily Forecast”) using the chosen weather theme, tasks, and a gentle message.
✅ Let user save or share the image as a background.
