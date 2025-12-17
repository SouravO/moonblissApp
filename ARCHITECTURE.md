# Moonbliss Production Architecture - Implementation Guide

## Overview

This document outlines the complete architectural refactoring of the Moonbliss women's health app, with a focus on production-quality data management, rule-based prediction engines, and optimized UI components.

## Key Components Implemented

### 1. **Data Schema & Storage Abstraction Layer**

**Files:**

- `src/infrastructure/storage/schema.js` - Normalized data structures
- `src/infrastructure/storage/storageService.js` - Complete CRUD abstraction

**Features:**

- ✅ Namespace-based localStorage keys to prevent conflicts
- ✅ Normalized data schemas for UserProfile, MenstrualData, QuestionnaireAnswers
- ✅ Four service objects: userProfileService, menstrualDataService, questionnaireService, onboardingService
- ✅ No direct localStorage access from components (enforced via abstraction)
- ✅ Error handling on all operations
- ✅ Composite operations for complex workflows

**Usage:**

```javascript
import { storageService } from "../../infrastructure/storage/storageService.js";

// Get user profile
const profile = storageService.userProfileService.get();

// Save menstrual data
storageService.menstrualDataService.save(menstrualData);

// Mark onboarding complete
storageService.onboardingService.markComplete();
```

### 2. **20-Question Medical Questionnaire**

**File:** `src/domains/health/data/questionnaire.js`

**Structure:**

- **Cycle Basics** (5q): Age, cycle length, period duration, last period date, regularity
- **Symptoms** (7q): Cramps, flow heaviness, spotting, PMS symptoms, clotting, pain location, irregularities
- **Lifestyle** (5q): Stress level, exercise frequency, sleep quality, sleep hours, diet
- **Health History** (3q): Medical conditions, medications/birth control, tracking goals, preferred insights

**Features:**

- ✅ Multi-select, single-select, number, date, text input types
- ✅ Validation with error messages
- ✅ Question categorization and filtering
- ✅ Help text for each question
- ✅ Defaults and constraints (min/max for numbers)

**Functions:**

```javascript
getAllQuestions(); // Returns all 20 questions
getQuestionsByCategory(cat); // Filter by category
getQuestionById(id); // Find specific question
validateAnswer(questionId, val); // Returns error string or null
```

### 3. **Rule-Based Period Prediction Engine**

**File:** `src/domains/health/utils/periodPredictor.js`

**Pure Functions (No Side Effects):**

- `calculateNextPeriodDate()` - Predict next period
- `calculateDaysUntilNextPeriod()` - Days countdown
- `calculateCyclePhase()` - Current cycle phase (Menstrual/Follicular/Ovulation/Luteal)
- `getPeriodPredictionWindow()` - ±3 day variability window
- `isPeriodOverdue()` - Check overdue status
- `getFertilityWindow()` - Approximate ovulation window
- `getCyclePhaseRecommendations()` - Phase-based wellness tips

**Usage:**

```javascript
const nextDate = calculateNextPeriodDate("2025-01-15", 28);
const daysUntil = calculateDaysUntilNextPeriod("2025-01-15", 28);
const phase = calculateCyclePhase("2025-01-15", 28, 5);
```

### 4. **Derived State Selectors**

**File:** `src/domains/health/utils/selectors.js`

**Purpose:** Memoizable functions for computing derived state

**Functions:**

- `selectPeriodInfo()` - Complete period predictions
- `selectPeriodStatus()` - Human-readable status
- `selectPhaseWithRecommendations()` - Phase + wellness tips
- `selectPeriodTrackerState()` - UI-ready tracker data
- `selectHealthInsights()` - Context-aware insights
- `selectShouldPromptSymptomLogging()` - Smart prompts
- `selectCycleStatistics()` - Aggregated stats

**Usage with useMemo:**

```javascript
const trackerState = useMemo(
  () => selectPeriodTrackerState(menstrualData),
  [menstrualData]
);
```

### 5. **Multi-Step Questionnaire Modal**

**File:** `src/domains/health/components/ComprehensiveQuestionnaireModal.jsx`

**Features:**

- ✅ 5 questions per step (4 steps total)
- ✅ Progress bar with step tracking
- ✅ Previous/Next navigation with validation
- ✅ Real-time answer validation
- ✅ Error display for required fields
- ✅ Auto-save to storage on completion
- ✅ Memoized content component to prevent re-renders
- ✅ Support for all input types (text, number, date, select, multiselect, radio)

**Integration:**

```jsx
<ComprehensiveQuestionnaireModal
  isOpen={showQuestionnaire}
  onClose={closeQuestionnaire}
  onComplete={handleQuestionnaireComplete}
/>
```

### 6. **Optimized Period Tracker Component**

**File:** `src/domains/health/components/PeriodTracker.jsx`

**Optimizations:**

- ✅ React.memo for outer component
- ✅ Memoized content component (PeriodTrackerContent)
- ✅ useCallback for handler functions
- ✅ useMemo for selector calculations
- ✅ No unnecessary re-renders on parent updates

**Display Features:**

- 🔴 Countdown timer with overdue detection
- 📊 Cycle progress bar with percentage
- 🎯 Current phase detection with emoji
- 📅 Prediction window (early/expected/late dates)
- 💡 Top health insight card
- 🎨 Color-coded by phase (Red/Green/Orange/Blue)

### 7. **Questionnaire Flow Hook**

**File:** `src/domains/health/hooks/useQuestionnaireFlow.js`

**State Management:**

- Opens/closes questionnaire modal
- Handles completion flow
- Extracts questionnaire answers
- Maps to menstrual data
- Persists to storage

**Functions:**

```javascript
const {
  showQuestionnaire,
  isQuestionnaireComplete,
  openQuestionnaire,
  closeQuestionnaire,
  handleQuestionnaireComplete,
} = useQuestionnaireFlow();
```

### 8. **Enhanced Onboarding Page**

**File:** `src/shared/pages/Onboarding.jsx`

**Flow:**

1. User enters email and password
2. User profile created in localStorage
3. Comprehensive questionnaire modal opens
4. 20 questions are displayed in 4 steps
5. All answers saved to storage
6. Menstrual data extracted and stored
7. Onboarding marked complete
8. Redirect to home page

**State Management:**

- Simple login validation
- Step-based flow (login → questionnaire)
- Error handling and user feedback

### 9. **Enhanced App Router**

**File:** `src/app/router/index.jsx`

**Features:**

- ✅ Authentication state checking on mount
- ✅ Onboarding status verification
- ✅ Protected route logic
- ✅ Proper redirects based on user state
- ✅ Loading state while checking
- ✅ Storage event listeners for changes

**Route Logic:**

```
Not Logged In → /onboarding
Logged In + Not Onboarded → /onboarding
Logged In + Onboarded → /health (with tabs)
```

### 10. **Protected Route Component** (Future Use)

**File:** `src/shared/routing/ProtectedRoute.jsx`

**Pattern:**

```jsx
<ProtectedRoute
  path="/health"
  component={HealthHome}
  requireOnboarding={true}
/>
```

### 11. **Updated Period Tracking Hook**

**File:** `src/domains/health/hooks/usePeriodTracking.js`

**Features:**

- ✅ Fetches data from new storage service
- ✅ Error handling
- ✅ Loading state
- ✅ Derives hasPeriodData flag

## Architecture Principles

### 1. **No Direct localStorage Access**

❌ WRONG:

```javascript
const data = JSON.parse(localStorage.getItem("key"));
```

✅ RIGHT:

```javascript
const data = storageService.menstrualDataService.get();
```

### 2. **Pure Functions for Calculations**

All period prediction logic is pure (no side effects):

```javascript
// Pure - deterministic, testable
const nextDate = calculateNextPeriodDate(lastDate, cycleLength);

// Not pure - depends on current time
const daysUntil = calculateDaysUntilNextPeriod(lastDate, cycleLength);
// (But still deterministic for unit testing if we mock Date)
```

### 3. **Memoization for Performance**

Use selectors with useMemo to prevent recalculation:

```javascript
const trackerState = useMemo(
  () => selectPeriodTrackerState(menstrualData),
  [menstrualData]
);
```

### 4. **Component Memoization**

Prevent unnecessary re-renders:

```javascript
export default React.memo(PeriodTracker);
```

### 5. **Data Normalization**

Single source of truth for data structures:

```javascript
// All schemas defined in schema.js
const profile = createUserProfile(); // Ensures consistency
```

## Data Flow Diagram

```
Login Page
    ↓
Create UserProfile (storageService)
    ↓
Open ComprehensiveQuestionnaireModal
    ↓
Collect 20 Answers (5 questions × 4 steps)
    ↓
Validate Each Answer (validateAnswer)
    ↓
Save to Storage (questionnaireService.addAnswer)
    ↓
Extract Period Data (useQuestionnaireFlow)
    ↓
Update MenstrualData (menstrualDataService.update)
    ↓
Mark Onboarding Complete (onboardingService.markComplete)
    ↓
Redirect to /health
    ↓
PeriodTracker Component Renders
    ↓
usePeriodTracking Hook fetches data
    ↓
Selectors compute derived state (useMemo)
    ↓
PeriodTrackerContent renders memoized UI
```

## Testing Strategy

### Unit Tests (Pure Functions)

```javascript
// periodPredictor.test.js
test("calculateNextPeriodDate", () => {
  const result = calculateNextPeriodDate("2025-01-15", 28);
  expect(result).toBe("2025-02-12");
});

// questionnaire.test.js
test("validateAnswer - required field", () => {
  const error = validateAnswer("q1_age", null);
  expect(error).toBe("This field is required");
});
```

### Integration Tests (Storage Operations)

```javascript
test("saveCompleteOnboarding", () => {
  const userProfile = { email: "test@test.com" };
  const menstrualData = { cycleLength: 28 };
  storageService.saveCompleteOnboarding(userProfile, menstrualData);

  expect(storageService.userProfileService.exists()).toBe(true);
  expect(storageService.onboardingService.isComplete()).toBe(true);
});
```

### E2E Tests (User Flow)

```javascript
test("Complete onboarding flow", async () => {
  // 1. Login
  userEvent.type(emailInput, "test@test.com");
  userEvent.type(passwordInput, "password123");
  userEvent.click(signInButton);

  // 2. Fill questionnaire
  for (let i = 0; i < 20; i++) {
    fillQuestion(i);
  }

  // 3. Submit
  userEvent.click(completeButton);

  // 4. Verify redirect
  await waitFor(() => {
    expect(window.location.href).toContain("/health");
  });
});
```

## Performance Optimizations

### 1. **Component Memoization**

- `PeriodTracker` wrapped with `React.memo`
- `PeriodTrackerContent` wrapped with `React.memo`
- `QuestionField` wrapped with `React.memo`

### 2. **Callback Optimization**

- `useCallback` for event handlers to prevent child re-renders
- Stable function references across renders

### 3. **Selector Memoization**

- `useMemo` for period calculations
- `useMemo` for health insights
- Only recalculate when dependencies change

### 4. **Lazy Loading** (Future)

- Code-split questionnaire modal
- Lazy load health page components
- Dynamic import for heavy calculations

## Error Handling

### Storage Operations

```javascript
try {
  const data = storageService.menstrualDataService.get();
  // Use data
} catch (error) {
  console.error("Error loading menstrual data:", error);
  // Fallback to default/empty state
}
```

### Validation

```javascript
const error = validateAnswer(questionId, value);
if (error) {
  setErrors((prev) => ({ ...prev, [questionId]: error }));
  return; // Prevent submission
}
```

### API/Network (Future)

```javascript
try {
  const response = await fetch("/api/onboarding", { body: data });
  const result = await response.json();
} catch (error) {
  showToast("Network error. Please try again.");
}
```

## Debugging Guide

### Check Storage

```javascript
// In browser console
localStorage.getItem("moonbliss_user_profile");
localStorage.getItem("moonbliss_menstrual_data");
localStorage.getItem("moonbliss_questionnaire_answers");
```

### Verify Service Access

```javascript
import { storageService } from "@/infrastructure/storage/storageService.js";
console.log(storageService.userProfileService.get());
console.log(storageService.menstrualDataService.get());
```

### Test Period Calculations

```javascript
import { calculateNextPeriodDate } from "@/domains/health/utils/periodPredictor.js";
const nextDate = calculateNextPeriodDate("2025-01-15", 28);
console.log(nextDate); // '2025-02-12'
```

## Future Enhancements

### Phase 2: Advanced Features

- [ ] Symptom tracking during cycle
- [ ] Wellness product recommendations
- [ ] Community features
- [ ] Social sharing
- [ ] Notifications/reminders

### Phase 3: Backend Integration

- [ ] Replace localStorage with API calls
- [ ] User authentication (OAuth, JWT)
- [ ] Cloud data sync
- [ ] Multi-device support

### Phase 4: AI/ML Features

- [ ] Personalized predictions
- [ ] Anomaly detection
- [ ] Recommendations engine
- [ ] Health insights

### Phase 5: Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] Color contrast review

## File Structure Summary

```
src/
├── infrastructure/
│   └── storage/
│       ├── schema.js (Normalized data structures)
│       └── storageService.js (CRUD abstraction)
├── domains/
│   └── health/
│       ├── components/
│       │   ├── ComprehensiveQuestionnaireModal.jsx (20q wizard)
│       │   ├── PeriodTracker.jsx (Optimized display)
│       │   └── PeriodTrackerContent.jsx (Memoized)
│       ├── data/
│       │   └── questionnaire.js (20 questions + validation)
│       ├── utils/
│       │   ├── periodPredictor.js (Pure prediction functions)
│       │   └── selectors.js (Derived state calculations)
│       ├── hooks/
│       │   ├── useQuestionnaireFlow.js (Modal state management)
│       │   └── usePeriodTracking.js (Data fetching)
│       ├── pages/
│       │   └── HealthHome.jsx (Main dashboard)
│       └── services/
│           └── periodPredictor.js (Deprecated - use utils/)
├── shared/
│   ├── pages/
│   │   └── Onboarding.jsx (Enhanced login + questionnaire)
│   ├── layout/
│   │   └── BottomNav.jsx (Tab navigation)
│   └── routing/
│       └── ProtectedRoute.jsx (Route guards - future use)
└── app/
    └── router/
        └── index.jsx (Enhanced with storage service)
```

## Deployment Checklist

- [ ] All lint errors resolved
- [ ] All imports use relative paths (no @/ aliases in production)
- [ ] localStorage keys namespaced (moonbliss\_\*)
- [ ] No console.log() in production code (use proper logging)
- [ ] Error boundaries added to components
- [ ] Loading states implemented
- [ ] Mobile responsive tested
- [ ] iOS and Android APKs generated
- [ ] Backend API endpoints documented
- [ ] Privacy policy updated
- [ ] Terms of service created
- [ ] HIPAA compliance review (if required)
- [ ] Security audit completed
- [ ] Performance profiling done
- [ ] Battery usage optimized

## Contributing Guidelines

1. **Storage Operations**: Always use `storageService`
2. **Period Calculations**: Use functions from `periodPredictor.js`
3. **Derived State**: Use selector functions with `useMemo`
4. **New Components**: Apply `React.memo` if needed
5. **Event Handlers**: Use `useCallback` to prevent re-renders
6. **Error Handling**: Try-catch for localStorage, validation for inputs
7. **Testing**: Write unit tests for pure functions, integration tests for flows

## Support & Maintenance

For questions about the architecture:

1. Check this documentation first
2. Review function JSDoc comments
3. Look at existing usage patterns
4. Create an issue with detailed context

---

**Last Updated:** January 2025  
**Status:** Production Ready - Phase 1  
**Version:** 1.0.0
