
## ✅ ADHD-Friendly App Audit Prompt

**Goal:** To critically evaluate the live app experience against established principles for reducing friction, cognitive load, and decision fatigue—the primary derailers for users with ADHD.

**App Context:** This is a planning and check-in tool where users set their Internal Weather (energy level), add focus items, identify barriers, receive gentle support, and generate a Daily Forecast.

**Rating Scale:**
* **0: Fails.** Causes significant overwhelm/paralysis.
* **1: Acceptable.** Clear, but requires a moment of concentration.
* **2: Excellent.** Instant clarity, no friction.

---

### I. Cognitive Load & Clarity (Reduce Overwhelm)

| Area to Audit | Key Question for the Tester | Target Result | Rating | Notes for Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Internal Weather Selection** | Is selecting my energy level intuitive and low-friction? | The weather metaphor (Clear, Cloudy, Rainy, Stormy, Quiet) must be immediately understandable. Selection should require **1 tap** with clear visual feedback. Descriptions should be concrete (e.g., "Heavy, slow, hard to get going" not "Low energy"). | **2** | ✅ Excellent! Weather descriptions are concrete ("Heavy, slow, hard to get going" for Rainy). Carousel auto-selects centered option, requires one tap. Visual feedback is clear with scaling and center indicator. |
| **Focus Item Limit** | Am I overwhelmed by too many options or unclear limits? | The app should limit to **5 or fewer** active focus items with a clear counter (e.g., "3/5"). The limit should be enforced with a helpful message, not a harsh error. | **2** | ✅ Excellent! Shows clear counter (e.g., "3/5") in button. Error message is neutral: "Maximum of 5 focus items reached" (not blaming). Button disables gracefully when limit reached. |
| **Focus Input Clarity** | Is it clear what I should write in a focus item? | Placeholder text should give concrete examples (e.g., "Send the email you keep delaying" not "Enter focus item"). The input should feel like a permission, not a demand. | **2** | ✅ Excellent! Dynamic placeholders with concrete examples ("Send the email you keep delaying", "Stretch between calls"). Changes based on day/time. Feels like permission, not demand. |
| **Barrier Selection** | Is identifying barriers overwhelming or judgmental? | Barriers should be grouped logically (Energy & Motivation, Focus & Overwhelm, etc.). Selection should feel like self-reflection, not self-criticism. Custom barriers should be easy to add. | **2** | ✅ Excellent! Language is compassionate: "What feels hard?" (not "What's blocking you?"). Barriers grouped logically with helpful descriptions. Custom barrier textarea is prominent and easy. |
| **Navigation Flow** | Can I understand where I am and where to go next? | Each page should have clear visual hierarchy. Back buttons should be obvious. The path from Weather → Focus → Barriers → Support should feel natural, not like a maze. | **2** | ✅ Excellent! Clear back buttons (ArrowLeft icon) on every page. Logical flow: Home → Focus → Gentle Support. "Next: Gentle Support" button guides flow. Clear page headers. |
| **Visual Design** | Does the UI reduce or increase cognitive load? | Whitespace is generous. Key action buttons are high-contrast and large enough to tap easily. Weather themes provide visual context without being distracting. No surprising pop-ups or auto-playing elements. | **2** | ✅ Excellent! Generous whitespace throughout. Weather themes provide context without distraction. Buttons are high-contrast (slate-900 on white). No pop-ups or auto-playing elements. Rounded corners feel gentle. |

---

### II. Check-In Flow & Momentum (Reduce Procrastination)

| Area to Audit | Key Question for the Tester | Target Result | Rating | Notes for Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Starting Check-In** | How many taps does it take to begin my daily check-in? | **Maximum of 2 taps** from the home screen to start setting weather. The main CTA should read like a permission (e.g., "Set today's energy" not "Begin check-in"). | **1** | ⚠️ Acceptable. Weather section appears on home page if not set, so can be 1 tap. But if weather is already set, need to click edit button (2 taps). Button says "Set Energy" which is good, but could be more permission-like ("Set today's energy"). |
| **Weather Selection Speed** | Can I quickly select my energy level without overthinking? | The carousel/selector should be intuitive—either auto-selects the centered option or requires one clear tap. No need to scroll through confusing options. | **1** | ⚠️ Acceptable. Carousel auto-selects centered option, but still requires explicit tap to confirm. Could be clearer that tapping selects it. Scrolling is smooth but might feel like extra work. Consider making auto-selection more obvious. |
| **Adding Focus Items** | Is adding a focus item frictionless or does it feel like work? | The input should be prominent and inviting. Placeholder suggestions should help, not overwhelm. Adding should feel like permission to name what matters, not a chore. | **2** | ✅ Excellent! Input is prominent. Placeholder suggestions are helpful (shows 2-3 examples). "Add focus" button feels like permission. Keyboard shortcut (Cmd/Ctrl+Enter) for power users. |
| **Barrier Identification** | Does identifying barriers feel supportive or shame-inducing? | The language should be compassionate ("What feels hard?" not "What's blocking you?"). Barrier options should feel like tools for understanding, not labels for failure. | **2** | ✅ Excellent! Perfect language: "What feels hard? (needed before the next step)" - feels supportive, not judgmental. Barrier groups have helpful descriptions. Emojis make it feel lighter. |
| **Anchor/Timing Options** | Are anchors (at/while/before/after) helpful or overwhelming? | Anchors should feel optional and supportive, not required. Suggestions should be relevant and easy to select. The UI should make it clear this is optional. | **2** | ✅ Excellent! Clearly marked "optional" in label: "Anchor it to something? (optional)". Helpful explanation: "If it helps, link it to a time or rhythm so it feels lighter." Suggestions are relevant and easy to tap. |
| **Completing Check-In** | Is saving my check-in clear and satisfying? | The save button should be prominent and the action should feel like an accomplishment. Error messages should be helpful, not shaming. | **1** | ⚠️ Acceptable. Save button is prominent ("Save check-in"). Shows loading state with spinner. But no celebration/confirmation when saved (just moves to forecast). Error messages are helpful and non-blaming. Could add a brief success message. |

---

### III. Support & Guidance (Combat Overwhelm)

| Area to Audit | Key Question for the Tester | Target Result | Rating | Notes for Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Support Message Relevance** | Do the gentle support messages actually help, or do they feel generic? | Support messages should be specific to the barrier selected and the weather level. They should feel like a friend's suggestion, not a generic tip. | **2** | ✅ Excellent! Messages are highly specific to each barrier (e.g., "Name the first physical motion—open the tab, lay out the supplies" for stuck-frozen). Weather support messages match the energy level. Feel like a friend's suggestion. |
| **Support Message Tone** | Is the language compassionate and non-judgmental? | Messages should avoid "should" language. They should offer options, not commands. Tone should match the weather (gentle for stormy, encouraging for clear). | **2** | ✅ Excellent! No "should" language found. Messages offer options ("Try a body double, a short timer, or a sound change"). Weather messages match tone (gentle for stormy: "Protect your system"). |
| **Daily Forecast Clarity** | Is the Daily Forecast useful or just pretty? | The forecast should clearly show what matters today. It should be readable at a glance. The wallpaper feature should feel like a helpful tool, not a gimmick. | **1** | ⚠️ Acceptable. Shows all focus items with anchors, readable. But shows ALL items, not prioritized. Wallpaper feature is useful but could be clearer about its purpose. Consider highlighting the first/next item more prominently. |
| **Energy Adjustment** | Can I easily change my energy level if it shifts during the day? | There should be a clear way to adjust weather without losing my focus items. The adjustment should feel like self-care, not failure. | **2** | ✅ Excellent! Clear edit button (RotateCcw icon) on weather summary. Clicking it opens weather selector without losing focus items. Language is neutral ("Change weather"), feels like self-care. |
| **Focus Item Completion** | When I mark a focus item complete, does it feel satisfying? | Completion should trigger a small, satisfying visual feedback (animation, emoji, or color change). It should feel like progress, not just checking a box. | **0** | ❌ Fails. When marking complete, icon changes from Circle to CheckCircle2, item moves to "Completed" section with strikethrough. But no animation, no celebration, no dopamine boost. Feels like checking a box, not progress. **Add: gentle animation, brief emoji, or color transition.** |

---

### IV. Tone & Feedback (Maintain Dopamine/Reduce Shame)

| Area to Audit | Key Question for the Tester | Target Result | Rating | Notes for Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Language Throughout** | Does the app's language feel supportive, motivating, and free of shame or guilt? | Avoid words like "Fail," "Should," "Lazy," "Must," or "Need to." Use phrases like "What matters today," "Gentle support," "Progress saved," or "Let's pivot." Questions should feel curious, not demanding. | **1** | ⚠️ Acceptable. Most language is excellent ("What matters today", "Gentle support", "What feels hard?"). But found "Must be at least 8 characters" in password validation (auth pages). Main app language is great, but auth pages need review. |
| **Error Messages** | When something goes wrong, does it feel like my fault or a system issue? | Error messages should be helpful and non-blaming. "Maximum focus items reached" is better than "You've added too many." Validation should guide, not judge. | **2** | ✅ Excellent! Error messages are neutral and helpful: "Maximum of 5 focus items reached", "A focus item with this description already exists". Validation errors clear when user starts typing. No blaming language. |
| **Empty States** | When I haven't added anything yet, does it feel welcoming or empty? | Empty states should feel like permission to start, not pressure to perform. "Drop today's focus when you're ready" is better than "No focus items added." | **2** | ✅ Excellent! Perfect empty state: "Nothing added yet. Drop today's focus when you're ready." Feels like permission, not pressure. Button says "Add focus" (not "Start now"). |
| **Completion Feedback** | When I complete a focus item or save my check-in, does it feel rewarding? | Completion should trigger immediate, satisfying feedback (visual change, gentle animation, or encouraging text). It should feel like progress, not just data entry. | **0** | ❌ Fails. No celebration when completing focus items (just icon change). Save shows spinner then moves to forecast, no "Saved!" message. **Add: brief success message, gentle animation, or encouraging text when saving.** |
| **Progress Indicators** | Can I see my progress without feeling judged? | Progress should feel like information, not evaluation. "3/5 focus items" is neutral; "Only 2 more to go!" might feel like pressure. | **2** | ✅ Excellent! Progress shown as neutral information: "3/5" in button. No pressure language. Completed items shown separately without judgment. |

---

### V. Accessibility & Usability (Reduce Friction)

| Area to Audit | Key Question for the Tester | Target Result | Rating | Notes for Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Experience** | Is the app easy to use on a phone? | Buttons should be large enough to tap easily (minimum 44x44px). Text should be readable without zooming. Scrolling should be smooth and predictable. | **2** | ✅ Excellent! Buttons use px-6 py-4 (24px padding) = ~48px+ height, exceeds minimum. Text is readable. Smooth scrolling. Mobile-responsive design with proper spacing. |
| **Dark Mode** | Does dark mode reduce eye strain without losing clarity? | Dark mode should be comfortable for low-light use. Contrast should remain high enough for readability. Weather themes should adapt appropriately. | **2** | ✅ Excellent! Dark mode implemented throughout. Weather themes adapt (stormy uses white text). Contrast maintained. Theme toggle easily accessible. |
| **Keyboard Navigation** | Can I use the app without a mouse/touchscreen? | All interactive elements should be keyboard accessible. Focus indicators should be clear. Tab order should be logical. | **1** | ⚠️ Acceptable. Interactive elements are keyboard accessible (buttons, inputs). Focus rings present (focus:ring-2). But need to verify tab order is logical and all elements are reachable. Some complex interactions (weather carousel) may be difficult with keyboard only. |
| **Loading States** | When data is loading, do I know what's happening? | Loading states should be clear but not anxious. "Warming up your companion..." is friendly; "Loading..." is neutral. Errors should be helpful, not cryptic. | **2** | ✅ Excellent! Loading message is friendly: "Warming up your companion..." (not anxious). Spinner shows during saves. Error messages are helpful: "Failed to save energy level" with context. |
| **Data Persistence** | If I close the app mid-check-in, is my progress saved? | Check-ins should auto-save as users progress. Users shouldn't lose work if they navigate away. Recovery should be seamless. | **0** | ❌ Fails. No auto-save. Data only saves when user clicks "Set Energy" or "Save check-in" buttons. If user navigates away or closes app, progress is lost (stored in React state only). **Add: auto-save to localStorage or auto-save on blur/change.** |

---

## 📊 Audit Summary

### Overall Score: **32/50** (64%)

**Breakdown by Section:**
- **I. Cognitive Load & Clarity:** 12/12 (100%) ✅
- **II. Check-In Flow & Momentum:** 9/12 (75%) ⚠️
- **III. Support & Guidance:** 8/10 (80%) ⚠️
- **IV. Tone & Feedback:** 7/10 (70%) ⚠️
- **V. Accessibility & Usability:** 7/10 (70%) ⚠️

### 🎯 Strengths (Rating: 2)
- **Weather selection** - Concrete descriptions, intuitive carousel
- **Focus input** - Dynamic placeholders, feels like permission
- **Barrier identification** - Compassionate language ("What feels hard?")
- **Support messages** - Specific, helpful, friend-like tone
- **Visual design** - Generous whitespace, weather themes, no distractions
- **Error handling** - Neutral, helpful messages
- **Empty states** - Welcoming, permission-based language
- **Mobile experience** - Large tap targets, readable text
- **Dark mode** - Well implemented with theme adaptation

### ⚠️ Areas Needing Improvement (Rating: 1)
- **Starting check-in** - Could be clearer when weather is already set
- **Weather selection speed** - Auto-selection could be more obvious
- **Completing check-in** - No celebration/confirmation message
- **Daily Forecast** - Shows all items, could prioritize first/next
- **Language** - "Must" found in password validation (auth pages)
- **Keyboard navigation** - Complex interactions may be difficult

### ❌ Critical Issues (Rating: 0)
1. **Focus Item Completion** - No celebration/animation when marking complete. Feels like checking a box, not progress.
2. **Completion Feedback** - No success message when saving check-in.
3. **Data Persistence** - No auto-save. Users lose progress if they navigate away or close app.

### 🚀 Priority Fixes

**High Priority:**
1. Add auto-save to localStorage (prevents data loss)
2. Add celebration animation/feedback when completing focus items
3. Add success message when saving check-in

**Medium Priority:**
4. Make weather auto-selection more obvious
5. Highlight first/next item in Daily Forecast
6. Review auth page language ("Must" → "At least")

**Low Priority:**
7. Improve keyboard navigation for complex interactions
8. Add brief confirmation when weather is already set

---

**Overall Assessment:** Your app is **excellent** at reducing cognitive load and providing supportive language. The main gaps are in **completion feedback** (no dopamine boost) and **data persistence** (risk of losing work). These are fixable and would significantly improve the ADHD-friendly experience.

