# Login & Logout Flow Fixes

## Problem Summary
The sign-in flow was not redirecting properly to the health page after completing the questionnaire, and the logout button was not working correctly.

## Root Causes Identified

1. **Modal Not Closing**: The ComprehensiveQuestionnaireModal was calling `onComplete` but never closing itself
2. **AppRouter Not Re-checking**: The AppRouter component only checked login/onboarded status once on mount, so when onboarding was marked complete, it didn't re-evaluate and show the main app
3. **Navigation Race Condition**: `history.push()` was happening while the AppRouter still thought the user was not onboarded

## Solutions Implemented

### 1. **Onboarding.jsx** - Login Flow Fix

**Before**: 
- After login, directly marked onboarding complete and navigated
- Didn't show questionnaire modal properly

**After**:
- Login → Opens questionnaire modal (DON'T mark complete yet)
- Questionnaire completion → Marks onboarding complete → Closes modal → Dispatches custom event → Navigates to /health

```javascript
const handleQuestionnairesComplete = useCallback(
  async (answers) => {
    handleQuestionnaireComplete(answers);
    storageService.onboardingService.markComplete();
    closeQuestionnaire(); // Close modal first
    window.dispatchEvent(new Event("onboarding-complete")); // Trigger AppRouter check
    setTimeout(() => {
      history.push("/health"); // Navigate after state update
    }, 300);
  },
  [handleQuestionnaireComplete, closeQuestionnaire, history]
);
```

### 2. **AppRouter (src/app/router/index.jsx)** - Router State Detection Fix

**Before**:
- Only checked auth status once on component mount
- Never re-evaluated when user completed onboarding

**After**:
- Listens to custom "onboarding-complete" event
- Re-checks auth status when event fires
- Allows router to switch from Onboarding view to MainContent view

```javascript
useEffect(() => {
  const checkAuth = () => {
    setLoggedIn(storageService.userProfileService.exists());
    setOnboarded(storageService.onboardingService.isComplete());
    setReady(true);
  };

  checkAuth();

  const handleOnboardingComplete = () => {
    checkAuth(); // Re-check and update router state
  };

  window.addEventListener("onboarding-complete", handleOnboardingComplete);
  
  return () => {
    window.removeEventListener("onboarding-complete", handleOnboardingComplete);
  };
}, []);
```

### 3. **Profile.jsx** - Logout Flow Fix

**Before**:
- `localStorage.clear()` didn't use proper storage service
- Didn't trigger router re-evaluation
- Navigation happened before data was cleared

**After**:
- Uses `storageService.clearAllData()` for proper cleanup
- Dispatches "onboarding-complete" event to trigger AppRouter re-check
- Waits for state update before navigation

```javascript
const logout = (mode = "wipe_data") => {
  if (mode === "wipe_data") {
    storageService.clearAllData();
  } else {
    storageService.onboardingService.reset();
  }
  
  window.dispatchEvent(new Event("onboarding-complete")); // Trigger router update
  
  setTimeout(() => {
    history.push("/");
    window.location.reload();
  }, 300);
};
```

## Complete User Flow

### Sign In Flow
1. User enters email/password → clicks "Sign in"
2. `handleLogin` saves user profile (but doesn't mark onboarded)
3. Questionnaire modal opens
4. User completes questionnaire → clicks "Complete"
5. `handleQuestionnairesComplete` is called:
   - Saves questionnaire answers to storage
   - Marks onboarding as complete
   - Closes modal
   - **Dispatches "onboarding-complete" event**
   - AppRouter detects event and re-checks auth status
   - Router switches from Onboarding → MainContent
   - Navigates to `/health`
6. User sees Health Home page with all data

### Sign Out Flow
1. User clicks logout button in Profile
2. `logout` function:
   - Clears all user data from storage
   - **Dispatches "onboarding-complete" event**
   - AppRouter detects event and re-checks auth status
   - Router switches from MainContent → Onboarding
   - Navigates to `/`
3. User sees Onboarding/Login page

## Testing Checklist
- [ ] Sign in with email/password
- [ ] Verify questionnaire modal appears
- [ ] Complete questionnaire
- [ ] Verify redirect to /health happens
- [ ] Verify user data is saved (profile, answers, menstrual data)
- [ ] Click logout button
- [ ] Verify all data is cleared
- [ ] Verify redirect to login page happens
- [ ] Verify new login starts fresh (no old data)

## Console Logs for Debugging
Added console.log statements to track the flow:
- "Questionnaire completed with answers"
- "Onboarding marked complete"
- "Questionnaire modal closed"
- "Onboarding complete event dispatched"
- "Navigating to /health"
- "Auth check - loggedIn: X, onboarded: Y"
- "Storage changed - rechecking auth"
- "Onboarding complete event triggered"
- "Logging out - mode: X"
- "Data cleared, dispatching logout event"
