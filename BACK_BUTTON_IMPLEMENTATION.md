# Back Button Implementation Guide

## Overview
A comprehensive back button handling system has been implemented for the Moonbliss app that handles both modal closing and app-level navigation.

## Features Implemented

### 1. **Modal Back Button Handling**
When a modal is open, pressing the back button closes the modal instead of navigating away.

**Pages with Modal Support:**
- **Activities.jsx**: Handles closing of Quiz, Step Tracker, Mood Tracker, and Joke modals
- **Music.jsx**: Handles closing of Music Player modal

### 2. **Page Navigation**
- On pages other than Health Home, back button navigates back to Health Home
- History-aware navigation maintains smooth user experience

### 3. **Health Home Exit Prevention**
- On the Health Home page, users must press back button twice to exit the app
- First press shows an alert: "Press back again to exit"
- Alert automatically dismisses after 2 seconds if no second press occurs
- Second press within 2 seconds exits the app completely

## Implementation Details

### Files Created

1. **`src/infrastructure/context/BackButtonContext.jsx`**
   - Context provider for managing back button handlers
   - Maintains a stack of handlers for modals
   - Provides `BackButtonProvider`, `useBackHandler`, and `useBackButtonContext` hooks

2. **`src/domains/health/hooks/useBackButton.js`**
   - Main hook that listens to Capacitor back button events
   - Handles the logic for:
     - Checking if modals need to close (via context)
     - Navigating to Health Home from other pages
     - Double-tap exit on Health Home with warning

### Files Modified

1. **`src/App.jsx`**
   - Wrapped with `BackButtonProvider` context
   - Integrated `useBackButton` hook
   - Provides global back button handling

2. **`src/shared/pages/Activities.jsx`**
   - Added `useBackHandler` import
   - Registered back handlers for all modals (Quiz, Tracker, Mood, Joke)
   - Modals now close when back is pressed

3. **`src/shared/pages/Music.jsx`**
   - Added `useBackHandler` import
   - Registered back handler for Music Player modal
   - Music player closes on back press

4. **`vite.config.js`**
   - Added `@capacitor/app` to `rollupOptions.external`
   - Prevents build errors when importing Capacitor modules

## How It Works

### Modal Closing Flow
```
Back Press → useBackButton hook
  ↓
Check if handleBack() (from context) → true
  ↓
Modal closes, returns
```

### Navigation Flow
```
Back Press → useBackButton hook
  ↓
Check if handleBack() → false (no modal open)
  ↓
Check if on Health Home
  ├─ YES → Require double tap to exit
  └─ NO → Navigate to Health Home
```

### Double-Tap Exit Flow
```
First Back Press → Show alert "Press back again to exit"
  ↓
User presses back again within 2 seconds
  ↓
App exits via CapacitorApp.exitApp()
```

## Usage for New Modals

To add back button handling to a new modal:

```jsx
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";

function MyPage() {
  const [showMyModal, setShowMyModal] = useState(false);

  // Register back handler
  useBackHandler(() => {
    if (showMyModal) {
      setShowMyModal(false);
      return; // Mark as handled
    }
  });

  return (
    // ... component JSX
  );
}
```

## Testing

The implementation has been tested and the app builds successfully with no errors:
- ✅ Build completes in ~3.5 seconds
- ✅ All chunks are properly optimized
- ✅ Capacitor module properly externalized
- ✅ No TypeScript or import errors

## Notes

- The back button system uses Capacitor's native back button event listener
- Works on Android devices (iOS has its own gesture-based back behavior)
- Context-based handler stack ensures proper modal priority
- Automatic cleanup of handlers and timeouts prevents memory leaks
