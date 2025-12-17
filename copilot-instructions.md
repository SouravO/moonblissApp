# Copilot Instructions – Moonbliss

## Mobile-First, Scalable Women’s Health Application

You are contributing to **Moonbliss**, a **women’s menstrual cycle tracking mobile application**.

Moonbliss is:

- A **health-related application**
- **Mobile-only** (Android & iOS)
- **Privacy-first**
- Built for **long-term scalability**

### Technology Stack

- React (TypeScript)
- Ionic Framework
- Capacitor
- Tailwind CSS
- Redux Toolkit

Treat this project as a **production-grade mobile application**, even during POC development.

All generated code must strictly follow the rules below.

---

## 1. Core Architecture (Mandatory)

Moonbliss uses a **layered, scalable architecture**:

UI Layer (React + Ionic)
→ Application Layer (Use-cases)
→ Domain Layer (Cycle & health logic)
→ Infrastructure Layer (Storage, APIs, Native)

Rules:

- UI components must never contain business or health logic
- Domain logic must be pure, deterministic, and testable
- Domain must not depend on UI, storage, network, or Capacitor
- Infrastructure must be replaceable without changing domain logic

---

## 2. Folder Structure (Strict)

Follow this structure exactly:

src/
├── app/ # App bootstrap & providers
├── domain/ # Core menstrual & cycle logic (stable)
├── application/ # Use-cases / orchestration
├── infrastructure/ # Storage, APIs, native bridges
│ ├── storage/
│ ├── api/
│ └── native/
├── features/ # Feature-based UI modules
├── components/ # Shared reusable components
├── store/ # Redux Toolkit store
├── routes/ # Routing
├── hooks/ # Reusable hooks
├── styles/ # Tailwind & global styles
├── utils/ # Pure utilities
└── types/ # Global types

Rules:

- Feature-based architecture only
- Page-based or screen-based architectures are forbidden
- No cross-layer coupling

---

## 3. Health & Medical Safety Rules (Critical)

Moonbliss is **not a medical device**.

Rules:

- Do NOT provide medical diagnosis or treatment
- Do NOT use language such as “diagnosis”, “treatment”, or “medical advice”
- Use neutral terms like:
  - “prediction”
  - “estimate”
  - “cycle trend”
- Always assume predictions are **approximations**
- Handle irregular cycles safely without assumptions
- Health logic must be explainable and auditable

---

## 4. Privacy & Sensitive Data Protection

Menstrual and health data is **highly sensitive**.

Rules:

- Never log personal health data
- Never store sensitive data in LocalStorage
- Use encrypted storage mechanisms only
- No analytics or tracking by default
- Design for:
  - Data deletion
  - Data export
  - User consent
- Assume future compliance requirements (GDPR-like)

---

## 5. Mobile-First & 100% Responsive Design

Moonbliss is **mobile-only**.

Rules:

- Design for phones first (small → large)
- Touch-first interactions only
- Avoid desktop-only UI patterns
- Avoid fixed widths and pixel-based layouts
- Use flexbox/grid consistently

Ionic Rules:

- Prefer Ionic components for navigation and gestures
- Do not override Ionic defaults unless required
- Respect platform-specific UX behavior

---

## 6. Styling Rules (Tailwind + DRY)

- Tailwind CSS is the preferred styling solution
- Avoid inline styles
- Avoid duplicated Tailwind class sets
- Extract repeated styles into reusable components or utilities
- No copy-paste styling

Performance:

- Avoid heavy animations
- Prefer CSS transitions over JavaScript animations
- Respect reduced-motion preferences

---

## 7. Performance Rules (Mandatory for Mobile)

React:

- Use `React.memo` for reusable components
- Use `useCallback` and `useMemo` only when rerenders are expensive
- Avoid anonymous functions inside large lists
- Virtualize long lists where applicable

Bundling:

- Lazy-load routes
- Lazy-load heavy components
- Avoid unnecessary or heavy dependencies

WebView Constraints:

- Assume limited memory and CPU
- Avoid deep DOM nesting
- Avoid heavy SVG, canvas, or complex animations

---

## 8. State Management & API Design

State Management:

- Use Redux Toolkit for global state only
- Keep UI-only state inside components
- Redux state must remain serializable
- Do not store derived data unnecessarily

API Rules:

- Never call `fetch` or `axios` directly inside components
- All API logic must live in the infrastructure layer
- APIs must be versionable and scalable
- Design APIs assuming:
  - Latency
  - Errors
  - Pagination
  - Offline scenarios

Offline-First:

- Moonbliss must work without network access
- Sync logic must be pluggable later
- Storage abstraction is mandatory

---

## 9. Storage & Capacitor Rules

Storage:

- Use IndexedDB or secure storage
- Access storage only through repository abstractions
- Never access storage directly from UI

Capacitor:

- Wrap all native functionality in service layers
- UI must not directly call Capacitor APIs
- Platform checks are mandatory

---

## 10. DRY & Strong Coding Practices

DRY Principle:

- No duplicate logic
- No duplicate styles
- No duplicate API handling
- Reuse domain logic consistently

Code Quality:

- TypeScript strict mode is mandatory
- Avoid `any`
- Write small, testable, pure functions
- Components must remain under ~300 lines
- Prefer composition over inheritance

---

## 11. Scalability & Future Readiness

Always design as if these will be added later:

- Backend APIs
- Authentication
- Cloud sync
- Opt-in analytics
- Personalization logic (ML-assisted)

Rules:

- Include versioning fields in data models
- Keep domain logic explainable and auditable
- Avoid tight coupling between layers

---

## 12. Forbidden Practices

The following are strictly forbidden:

- Mixing business or health logic inside UI components
- Hardcoding values in components
- Ignoring mobile performance constraints
- Writing throwaway POC code
- Desktop-first design assumptions
- Insecure handling of sensitive data

---

## 13. Definition of Done

A feature is complete only if:

- Architectural rules are followed
- It is fully mobile-responsive
- It performs well on low-end devices
- DRY principles are respected
- It can scale without refactoring

---

## Output Expectations

- Generate clean, production-ready code only
- No experimental or hacky solutions
- No console logs
- No unnecessary comments
- Favor clarity, safety, performance, and maintainability
