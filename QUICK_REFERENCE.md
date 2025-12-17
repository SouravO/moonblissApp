# Moonbliss Quick Reference Guide

## 🚀 Getting Started

### For Developers

```bash
# Clone and install
git clone <repo>
cd Moonbliss
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Check imports are correct (no @/ aliases)
grep -r "@/" src/ --include="*.jsx" --include="*.js"
```

### Directory Structure

```
src/
├── infrastructure/        # Data & Storage layer
│   └── storage/          # localStorage abstraction
├── domains/              # Feature domains
│   ├── health/           # Period tracking feature
│   └── commerce/         # Wellness products feature
├── shared/               # Shared components
│   ├── layout/           # Navigation
│   ├── pages/            # Onboarding, etc
│   └── routing/          # Route guards
└── app/                  # App root
    └── router/           # Main router
```

## 📦 Key Files & Their Purpose

| Path                 | Purpose                    | When to Edit                   |
| -------------------- | -------------------------- | ------------------------------ |
| `schema.js`          | Data structure definitions | Adding new data types          |
| `storageService.js`  | Storage operations         | Adding new CRUD operations     |
| `questionnaire.js`   | 20 health questions        | Modifying questions/validation |
| `periodPredictor.js` | Calculation logic          | Changing prediction algorithm  |
| `selectors.js`       | Derived state              | Adding new computed values     |
| `PeriodTracker.jsx`  | UI display                 | Changing UI/styling            |
| `Onboarding.jsx`     | Login + questionnaire flow | Changing onboarding flow       |
| `index.jsx` (router) | Route logic                | Adding new routes              |

## 💾 Storage Operations

### ✅ RIGHT - Use Storage Service

```javascript
import { storageService } from "../../infrastructure/storage/storageService.js";

// Get data
const profile = storageService.userProfileService.get();

// Save data
storageService.menstrualDataService.save(data);

// Check completion
if (storageService.onboardingService.isComplete()) {
  // redirect to home
}
```

### ❌ WRONG - Direct localStorage Access

```javascript
// Never do this!
const data = JSON.parse(localStorage.getItem("key"));
localStorage.setItem("key", JSON.stringify(data));
```

## 🧮 Period Calculations

### Pure Functions (No Side Effects)

```javascript
import {
  calculateNextPeriodDate,
  calculateDaysUntilNextPeriod,
  calculateCyclePhase,
} from "../utils/periodPredictor.js";

// All pure - deterministic, testable
const nextDate = calculateNextPeriodDate("2025-01-10", 28);
const daysUntil = calculateDaysUntilNextPeriod("2025-01-10", 28);
const phase = calculateCyclePhase("2025-01-10", 28, 5);
```

## 🎯 Derived State Selectors

### With useMemo (Best Performance)

```javascript
import { selectPeriodTrackerState } from "../utils/selectors.js";
import { useMemo } from "react";

function Component() {
  const menstrualData = usePeriodTracking();

  // Recalculates only when menstrualData changes
  const trackerState = useMemo(
    () => selectPeriodTrackerState(menstrualData),
    [menstrualData]
  );

  return <Display state={trackerState} />;
}
```

## 🔐 Component Optimization

### Use React.memo

```javascript
// Prevent re-renders when props don't change
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

export default MyComponent;
```

### Use useCallback

```javascript
const handleClick = useCallback(() => {
  // This function reference stays the same across renders
  doSomething();
}, [dependencyArray]);
```

## 📝 Questionnaire Integration

### Add New Questions

1. Edit `questionnaire.js`
2. Add question object to `QUESTIONS` array:

```javascript
{
  id: 'q21_new_question',
  category: QUESTIONNAIRE_CATEGORIES.LIFESTYLE,
  question: 'What is your question?',
  type: 'select', // text, number, date, select, multiselect, radio
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ],
  required: true,
  helpText: 'Optional help text'
}
```

3. Update step labels in modal if needed
4. Test validation with `validateAnswer()`

### Map Answers to Menstrual Data

In `useQuestionnaireFlow.js`:

```javascript
const extractPeriodData = () => {
  return {
    lastPeriodDate: answers.q4_last_period_date,
    avgCycleLength: parseInt(answers.q2_cycle_length, 10),
    // ... map other answers
  };
};
```

## 🧪 Testing Pure Functions

### Unit Test Example

```javascript
import { calculateNextPeriodDate } from "@/domains/health/utils/periodPredictor";

test("calculateNextPeriodDate", () => {
  const result = calculateNextPeriodDate("2025-01-10", 28);
  expect(result).toBe("2025-02-07");
});
```

### Integration Test Example

```javascript
import { storageService } from "@/infrastructure/storage/storageService";

test("saveAndRetrieve", () => {
  const data = { cycleLength: 28 };
  storageService.menstrualDataService.save(data);
  const retrieved = storageService.menstrualDataService.get();
  expect(retrieved.avgCycleLength).toBe(28);
});
```

## 🐛 Debugging

### Check Storage State

```javascript
// In browser console
localStorage.getItem("moonbliss_user_profile");
localStorage.getItem("moonbliss_menstrual_data");
localStorage.getItem("moonbliss_questionnaire_answers");
localStorage.getItem("moonbliss_onboarding_status");
```

### Verify Service

```javascript
// In browser console
import { storageService } from "./src/infrastructure/storage/storageService.js";
console.log(storageService.userProfileService.get());
console.log(storageService.menstrualDataService.get());
```

### Test Calculations

```javascript
// In browser console
import { calculateNextPeriodDate } from "./src/domains/health/utils/periodPredictor.js";
calculateNextPeriodDate("2025-01-10", 28);
```

## 🔄 Common Workflows

### Add New Feature

1. Create files in appropriate domain (`src/domains/<feature>/`)
2. Use storage service for data (`storageService.*`)
3. Use pure functions for calculations
4. Use selectors with memoization for derived state
5. Apply React.memo + useCallback for optimization
6. Add tests for pure functions

### Fix a Bug

1. Check browser console for errors
2. Verify localStorage state
3. Test pure functions in isolation
4. Check component props/state
5. Use React DevTools to inspect components
6. Add unit tests to prevent regression

### Add Data to Storage

1. Update `schema.js` factory function
2. Add CRUD methods to `storageService.js`
3. Use new service in components via import
4. Never access localStorage directly
5. Add error handling with try-catch

## 📱 Mobile Considerations

### Tailwind Responsive Classes

```jsx
// Mobile-first approach
<div className="px-4 sm:px-6 md:px-8">
  {/* Content */}
</div>

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="md:w-1/2">{/* Left */}</div>
  <div className="md:w-1/2">{/* Right */}</div>
</div>
```

### Testing on Device

```bash
# Build iOS app
ionic build ios

# Build Android app
ionic build android

# Or use Capacitor directly
npx cap run android
npx cap run ios
```

## 🚨 Common Issues & Fixes

### Issue: localStorage not persisting

**Solution**: Check if localStorage is enabled in browser

```javascript
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
} catch (e) {
  console.error("localStorage not available");
}
```

### Issue: Imports failing with @/ alias

**Solution**: Use relative imports instead

```javascript
// ❌ Don't use
import { Component } from "@/path/to/Component";

// ✅ Do use
import { Component } from "../../path/to/Component";
```

### Issue: Component re-rendering too much

**Solution**: Add React.memo and useMemo

```javascript
const MyComponent = React.memo(function MyComponent(props) {
  const memoizedValue = useMemo(() => expensiveCalc(), [deps]);
  return <div>{memoizedValue}</div>;
});
```

### Issue: Validation not working

**Solution**: Check validateAnswer returns error string (not boolean)

```javascript
// ✅ Correct - returns error string
const error = validateAnswer("q1_age", null);
if (error) {
  /* handle error */
}

// ❌ Wrong - this won't work
const isValid = validateAnswer("q1_age", null);
if (!isValid) {
  /* handle error */
}
```

## 📚 References

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture guide
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Full implementation details
- [React Hooks Docs](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)
- [Ionic React Docs](https://ionicframework.com/docs/react)

## 💡 Tips & Tricks

### Use localStorage for Development

```javascript
// Temporarily bypass service for testing
window.storageService = storageService;
// Then in console: storageService.menstrualDataService.get()
```

### Mock Date for Testing

```javascript
// Mock Date for deterministic period calculations
const mockDate = new Date("2025-01-15");
jest.spyOn(global, "Date").mockImplementation(() => mockDate);
```

### Profile Component Renders

```javascript
// React DevTools
// 1. Install React DevTools browser extension
// 2. Open DevTools → Components tab
// 3. Check "Highlight re-renders when components render"
// 4. See which components re-render unnecessarily
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0
