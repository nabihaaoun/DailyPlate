# DailyPlate 🍽️

> **A smart, offline-first personal meal rotation and planning application built with React Native, Expo, Redux Toolkit, and local SQLite.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-black.svg?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?logo=react)](https://reactnative.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764ABC.svg?logo=redux)](https://redux-toolkit.js.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?logo=sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![Status](https://img.shields.io/badge/Status-Private%20%2F%20In%20Active%20Development-orange.svg)]()
[![Rights](https://img.shields.io/badge/Rights-All%20Rights%20Reserved-red.svg)]()

---

## 📖 Product Overview

**DailyPlate** is designed to eliminate everyday decision fatigue in the kitchen. Traditional meal planning apps enforce rigid calendars, require account sign-ups, or charge recurring cloud subscriptions. 

DailyPlate introduces an **Option B derived meal rotation engine**:
- It tracks how recently each dish was cooked.
- It dynamically computes which meals are due next for breakfast, lunch, and dinner.
- It ensures complete household variety without locking you into strict dates.
- Everything runs **100% offline on-device** with personal data privacy guaranteed.

---

## ✨ Core Highlights & Features

### 🔄 Derived Rotation Engine
- **Option B Invariant**: Scheduling meals in advance as `planned` has **zero impact** on rotation cycles. Only confirmed cooked meals advance rotation.
- **Cycle Accumulation**: Automatically detects when all active dishes in a category have been completed at least once, resetting the rotation queue smoothly.
- **Tactile Celebrations**: Completing a rotation cycle triggers joyful visual banners and native haptic feedback.
- **Edge-Case Safety**: Robust logic for single-dish categories, empty categories, and deactivated items.

### 📅 7-Day Visual Planner
- **Horizontal Calendar Strip**: Monday–Sunday week selector with quick week switching (`‹` / `›`) and instant "Today" jump.
- **Month Picker**: Jump to any month or year to review past cooking logs or plan ahead.
- **Status Badges**: Clear visual states for `Planned`, `Cooked`, and `Skipped` meals.
- **Rescheduling**: 1-tap `MoveMealModal` allows moving planned meals across dates or meal slots effortlessly.

### ⚡ Smart Auto-Planner
- **Single-Slot `⚡ Suggest`**: Instantly suggests the least-recently prepared dish for any open slot.
- **`⚡ Fill Day`**: 1-tap fills all remaining meal slots for the selected date using the active rotation queue.
- **`📅 7-Day Auto-Plan`**: Generates a balanced 7-day proposed schedule, rotating through your recipes without premature repeats.

### 🔍 Real-Time Search & Catalog
- **Live Search Bar**: Keystroke-by-keystroke filtering with a one-tap clear button (`✕`).
- **Category Filter Pills**: Fast filtering by `All`, `Breakfast`, `Lunch`, and `Dinner`.
- **Rotation Progress**: Real-time visual progress bars showing how close each category is to completing a cycle.
- **Catalog Management**: Add individual dishes, batch add multiple dishes, edit names, or toggle active status.

### 🔒 Privacy & Data Protection
- **100% Offline-First**: Local SQLite database engine with zero external network tracking.
- **Local JSON Backup**: Export and import full database snapshots via device clipboard.
- **Safe Data Management**: Dedicated Danger Zone with two-step double-confirmation safeguards.

---

## 🏗️ Architecture

DailyPlate is engineered with a strict **4-layer architecture**:

```text
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

## 🛠️ Technology Stack

- **Application Framework**: React Native & Expo (SDK 57)
- **Primary Language**: TypeScript 5.9 (100% typed codebase)
- **State Management**: Redux Toolkit (RTK) with memoized reselect selectors
- **Database Engine**: Local SQLite (`expo-sqlite`) with atomic transactions
- **Navigation & Routing**: Expo Router (file-based navigation)
- **Design & Layout**: React Native StyleSheet (Flexbox, custom dark theme)
- **Haptic Engine**: `expo-haptics`
- **Testing Framework**: Vitest (65 automated unit tests)

---

## 👤 Author & Ownership

- **Lead Developer & Creator**: **Nabiha Aoun**
- **Contact**: [nabihaaoun25@gmail.com](mailto:nabihaaoun25@gmail.com)

---

## 🔒 Copyright & Proprietary Notice

Copyright © 2026 **Nabiha Aoun**. All rights reserved.

This repository and its codebase are private intellectual property. Unauthorized copying, cloning, distribution, commercial use, modification, or public reproduction of this software or its source files, via any medium, is strictly prohibited without prior written permission from the copyright owner.
