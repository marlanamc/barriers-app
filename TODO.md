# TODO: Testing & Making the App Useful

**Priority Focus**: Testing flow and making this app useful and worthwhile

## 🔴 Critical Testing (Do First)

### 1. Test Complete Check-In Flow
- [ ] Weather selection → focus items → barriers → anchors → gentle support → home page redirect
- [ ] Verify all data saves correctly at each step
- [ ] Test navigation flow doesn't break
- [ ] Verify gentle support page redirects to home after 3 seconds

### 2. Test Focus Item Management
- [ ] Add focus items (verify 1-5 limit works)
- [ ] Edit focus items (click pencil icon, verify edit page loads correctly)
- [ ] Delete focus items (verify deletion persists after hard reload)
- [ ] Reorder focus items (drag and drop)
- [ ] Mark items as complete
- [ ] Verify "No items yet" message shows when appropriate
- [ ] Test "You already have enough" message when 5 items exist

### 3. Test Planned Items Flow
- [ ] Create planned item (one-time, daily, weekly, monthly)
- [ ] Edit planned item (verify all fields save correctly)
- [ ] Delete planned item
- [ ] Verify planned items appear on correct dates
- [ ] Test recurrence patterns (weekly days, monthly dates, end dates)
- [ ] Verify planned items convert to focus items on their dates

### 4. Test Data Persistence
- [ ] Save check-in → hard reload → verify data persists
- [ ] Delete focus item → hard reload → verify deletion persists
- [ ] Clear cache and cookies → verify data still loads from database
- [ ] Test across different browsers/devices

### 5. Test Edge Cases
- [ ] Max 5 focus items (can't add more)
- [ ] Empty states (no focus items, no planned items)
- [ ] Network errors (offline mode, slow connection)
- [ ] Concurrent edits (two tabs open)
- [ ] Date changes (midnight rollover, timezone changes)
- [ ] Very long descriptions/text inputs

## 🟡 Important Improvements

### 6. Error Handling & User Feedback
- [ ] Add user-friendly error messages (replace alerts/console.errors)
- [ ] Add success toasts/notifications
- [ ] Add retry mechanisms for failed saves
- [ ] Add offline support indicators
- [ ] Show helpful hints/tooltips for complex features

### 7. Loading States & Performance
- [ ] Add skeleton screens for loading states
- [ ] Add progress indicators during saves
- [ ] Add save confirmations ("Saved!" feedback)
- [ ] Optimize database queries (check for N+1 queries)
- [ ] Add optimistic UI updates

### 8. Mobile Responsiveness
- [ ] Test all pages on phone screens
- [ ] Verify touch interactions work well
- [ ] Test keyboard handling (especially on iOS)
- [ ] Verify drag-and-drop works on mobile
- [ ] Check text input sizing and spacing

## 🟢 Nice to Have

### 9. Code Quality
- [ ] Clean up debug console.logs (keep only critical ones)
- [ ] Add proper error logging service
- [ ] Remove any test data
- [ ] Add TypeScript strict mode checks
- [ ] Add unit tests for critical functions

### 10. User Experience Enhancements
- [ ] Add keyboard shortcuts for common actions
- [ ] Add undo/redo for deletions
- [ ] Improve empty state messaging
- [ ] Add onboarding tooltips for new users
- [ ] Add search/filter for planned items

## 📝 Notes

- Focus on making the core flow bulletproof first
- User should never lose data
- All actions should have clear feedback
- App should work offline (at least read-only)

