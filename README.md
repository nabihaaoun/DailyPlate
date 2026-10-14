# DailyPlate 🍽️

> **Smart, offline-first mobile meal rotation and planning app built with React Native, Expo (SDK 57), Redux Toolkit, and SQLite.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-black.svg?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?logo=react)](https://reactnative.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764ABC.svg?logo=redux)](https://redux-toolkit.js.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?logo=sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![Vitest](https://img.shields.io/badge/Tests-65%20Passed-green.svg?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

**DailyPlate** solves decision fatigue in the kitchen by maintaining a **derived meal rotation engine**. Instead of locking you into rigid calendars or forcing cloud subscriptions, DailyPlate helps households balance their favorite home-cooked meals through automated rotation cycles, instant planning, and tactile mobile interactions.

Everything is stored **100% locally** in an on-device SQLite database with zero backend dependencies, zero authentication barriers, and complete data privacy.

---

## ✨ Key Features

### 🔄 Option B Derived Rotation Engine
- **Derived State Invariant**: Planning meals in advance has **zero effect** on rotation cycles. Only confirmed cooked meals advance rotation.
- **Cycle Accumulator**: Tracks when all active dishes in a category have been prepared at least once.
- **Celebration Micro-Interactions**: Completing a full rotation cycle triggers haptic celebrations and completion banners.
- **Edge-Case Resilience**: Safely handles single-dish categories, empty categories, and deactivated dishes without stalling the engine.

### 📅 Planner & 7-Day Calendar Strip
- **7-Day Strip**: Monday–Sunday week selector with intuitive week switcher (`‹` / `›`) and quick "Today" jump.
- **Month Picker Modal**: Jump directly to any month and year to view or adjust past and future plans.
- **Meal Slots**: Breakfast, Lunch, and Dinner cards with visual status badges (`Planned`, `Cooked`, `Skipped`).
- **1-Tap Reschedule**: Move planned meals to another date or meal slot via `MoveMealModal`.

### ⚡ Smart Auto-Planner & Suggestions
- **`⚡ Suggest` Button**: Available on every empty slot to instantly assign the least-recently cooked dish from that category's rotation.
- **`⚡ Fill Day`**: 1-tap auto-fills all remaining empty slots on the selected calendar date.
- **`📅 7-Day Auto-Plan`**: Generates a 7-day proposed schedule, rotating through your recipe catalog without immediate repeats, and writes all meals in a single SQLite transaction.

### 🔍 Real-Time Search & Dish Catalog
- **Live Search Bar**: Keystroke-by-keystroke filtering with a 1-tap clear button (`✕`) and haptic response.
- **Category Filter Pills**: Fast navigation across `All`, `Breakfast`, `Lunch`, and `Dinner`.
- **Rotation Summary Progress**: Visual bar tracking completion progress for each category.
- **Dish Management**: Add single dishes, batch add multiple dishes, edit names/categories, or soft-delete.

### 🔒 Privacy & Data Management
- **100% Offline-First**: Uses native SQLite on mobile devices with transparent `localStorage` fallback for web development.
- **JSON Backup Export & Import**: Export full database snapshots and restore them seamlessly.
- **Starter Dishes**: One-tap reload of 8 standard balanced starter dishes.
- **Danger Zone**: Clear local application data with two-step double confirmation safeguards.

---

## 🏗️ Architecture

DailyPlate enforces a strict **4-layer architecture** with unidirectional data flow:

```
┌────────────────────────────────────────────────────────┐
│                   Layer 4: UI Presentation             │
│  (Thin screens <80 LOC, modular components <120 LOC)  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│              Layer 3: Redux Toolkit (RTK)              │
│       (dishesSlice, mealsSlice, rotationSelectors)     │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│              Layer 2: SQLite Repositories              │
│     (mealsRepository, dishesRepository, client.ts)     │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│               Layer 1: Pure Domain Engine              │
│       (autoSuggestEngine.ts, dishSearch.ts, utils)     │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
DailyPlate/
├── assets/                     # App icons, splash screens, and images
├── src/
│   ├── app/                    # Expo Router screens (thin route handlers)
│   │   ├── _layout.tsx         # Root layout with Redux Provider & DB init
│   │   └── (tabs)/             # Main bottom tab navigators
│   │       ├── index.tsx       # Today screen (Today's plate & quick cook)
│   │       ├── planner.tsx     # 7-day horizontal calendar & auto-planner
│   │       └── dishes.tsx      # Dish catalog, search, and settings
│   ├── components/             # Reusable, modular UI components (<120 LOC)
│   │   ├── AutoPlanActionsBar.tsx
│   │   ├── AutoPlanModal.tsx
│   │   ├── CalendarStrip.tsx
│   │   ├── CategoryFilterPills.tsx
│   │   ├── DishPickerModal.tsx
│   │   ├── MealSlotCard.tsx
│   │   ├── RotationSummaryBar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SettingsModal.tsx
│   │   └── ...
│   ├── db/                     # SQLite client and repository layer
│   │   ├── client.ts           # Native SQLite database initialization
│   │   ├── client.web.ts       # Web localStorage fallback client
│   │   ├── dishesRepository.ts # CRUD for dishes
│   │   ├── mealsRepository.ts  # CRUD and batch upserts for meals
│   │   └── dataManagementRepository.ts # Backup export/import & reset
│   ├── domain/                 # Pure domain logic (zero UI/Redux dependency)
│   │   ├── autoSuggestEngine.ts# Rotation priority suggestion algorithms
│   │   └── dishSearch.ts       # Real-time search and filter engine
│   ├── store/                  # Redux Toolkit state management
│   │   ├── index.ts            # Root store definition
│   │   └── slices/             # Feature slices & memoized selectors
│   │       ├── dishesSlice.ts
│   │       ├── mealsSlice.ts
│   │       └── rotationSelectors.ts # Option B rotation cycle selectors
│   ├── types/                  # Shared TypeScript interfaces & types
│   └── utils/                  # Date helpers, haptics, and formatting
├── graphify-out/               # Knowledge graph artifacts (AST code-map)
├── app.json                    # Expo configuration
├── package.json                # Dependencies and project scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
- Optional: [Expo Go](https://expo.dev/go) app installed on your physical mobile device.

### 1. Clone the Repository
```bash
git clone https://github.com/nabihaaoun/DailyPlate.git
cd DailyPlate
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```

### 4. Run the App
- **Desktop Web Browser**: Open [http://localhost:8081](http://localhost:8081) directly in your browser.
- **Physical Phone**: Scan the QR code shown in the terminal using the **Expo Go** app (Android) or the default **Camera** app (iOS).
- **Emulators / Simulators**:
  - Press `i` to launch in the iOS Simulator.
  - Press `a` to launch in the Android Emulator.

---

## 🧪 Testing & Code Quality

DailyPlate maintains a 100% passing automated test suite covering domain logic, rotation invariants, date navigation, and Redux state transitions.

```bash
# Run unit tests (65 tests across 8 test suites)
npm test

# Run TypeScript compiler check
npx tsc --noEmit

# Run Expo / ESLint check
npx expo lint

# Run Expo dependency diagnostics
npx expo-doctor
```

---

## 👥 Author & Contributions

- **Lead Developer**: [Nabiha Aoun](https://github.com/nabihaaoun)
- **Contact**: [nabihaaoun25@gmail.com](mailto:nabihaaoun25@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
