# Fake News Checker Monorepo

## Overview

This repository is a monorepo for the Fake News Checker project, managed with [Turborepo](https://turborepo.com/) and using both Node.js (frontend, extension, shared packages) and Python (backend). The project aims to provide a robust system for detecting, analyzing, and reporting fake news, with both a browser extension and a web interface.

---

## Monorepo Structure

```
apps/
  fake-news-cheeker/      # Python backend (API, analysis, scraping)
  fake-news-extension/    # Browser extension (user interface)
  web/                    # System website (user interface)
  docs/                   # Documentation site
packages/
  eslint-config/          # Shared ESLint config
  typescript-config/      # Shared TypeScript config
  ui/                     # Shared React UI components
```

---

## Main Components

### 1. Backend: `apps/fake-news-cheeker`
- **Language:** Python
- **Purpose:** Provides the core API, fake news analysis, claim verification, and web scraping.
- **Structure:**
  - `ai/` — AI/ML clients
  - `algorithms/` — Analysis algorithms
  - `controllers/` — API controllers
  - `core/` — Error handling, exceptions
  - `models/` — Data models
  - `routes/` — API routes
  - `scrapers/` — News/content scrapers
  - `services/` — Business logic
  - `utils/` — Utilities
  - `validators/` — Input validation
- **Entry Point:** `main.py`

### 2. Browser Extension: `apps/fake-news-extension`
- **Language:** TypeScript, React
- **Purpose:** User-facing browser extension for checking news credibility directly on web pages.
- **Structure:**
  - `src/` — Main source code (components, hooks, pages, popup, options)
  - `public/` — Static assets
  - `index.html`, `options.html`, `popup.html` — Extension entry points
- **Build Tool:** Vite

### 3. Web App: `apps/web`
- **Language:** TypeScript, React, Next.js
- **Purpose:** System website for users to interact with the Fake News Checker platform.
- **Structure:**
  - `app/` — Next.js app directory
  - `public/` — Static assets

### 4. Documentation: `apps/docs`
- **Language:** TypeScript, Next.js
- **Purpose:** Project documentation site.

### 5. Shared Packages: `packages/`
- `ui/` — Shared React UI components
- `eslint-config/` — Shared ESLint config
- `typescript-config/` — Shared TypeScript config

---

## Technologies Used
- **Monorepo Management:** Turborepo
- **Frontend:** React, Next.js, Vite, TypeScript
- **Backend:** Python
- **Package Management:** npm

---

## Architecture Diagram (Text)

```
[Browser Extension] <----> [Backend API (Python)] <----> [Scrapers, AI, DB]
        |                        ^
        v                        |
   [Web App (Next.js)] ----------
```
- Both the browser extension and the web app communicate with the Python backend API.
- The backend handles analysis, claim verification, and scraping.

---

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Build all apps/packages:**
   ```sh
   npx turbo build
   ```
3. **Develop:**
   ```sh
   npx turbo dev
   ```
4. **Run backend (Python):**
   ```sh
   cd apps/fake-news-cheeker
   # (activate venv if needed)
   python main.py
   ```

---

## License & Usage Policy

- **All Rights Reserved.**
- Use, copying, or distribution is strictly prohibited without explicit written permission from the owner (SALIH OTMAN, Al-Edrisy, 2025).
- See `LICENSE` and `POLICY.md` for details.

---

## Contributions

- Contributions are welcome but require explicit approval from the repository owner.
- Please open an issue or contact the owner before submitting a pull request.

---

## 1. Syncing Theme Between Website and Extension

**Goal:**  
If a user changes the theme (e.g., light/dark mode) on the website, the browser extension should also update its theme, and vice versa. You also want the theme to respect the system (OS/browser) preference.

---

### Is it Possible?

**Yes, but with some caveats:**

- **Browser Extension and Website are Separate Contexts:**  
  They run in different environments (the extension is isolated from the website for security reasons).
- **Direct Sync is Not Automatic:**  
  You need to implement a way for them to communicate or share settings.

---

### How Can You Achieve This?

#### 1. **Shared Backend (Best for Authenticated Users)**
- Store the user’s theme preference in your backend (e.g., in a user profile).
- Both the website and extension fetch and update the theme setting from the backend.
- When the user changes the theme in one, it updates the backend, and the other can fetch the new value.

#### 2. **Browser Storage Sync (For Extensions)**
- Chrome/Edge/Firefox extensions can use `chrome.storage.sync` to store settings that sync across browsers where the user is logged in.
- The website can communicate with the extension via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) or by injecting a content script, but this is more complex and less robust than a backend.

#### 3. **System Theme Detection**
- Both the website and extension can detect the system theme using CSS media queries:
  ```js
  window.matchMedia('(prefers-color-scheme: dark)').matches
  ```
- You can default to the system theme and allow the user to override it.

#### 4. **Manual Sync (Not Recommended)**
- Ask the user to set the theme in both places. Not user-friendly.

---

### Recommended Approach

**For the best user experience:**
- Use the backend to store the user’s theme preference (if logged in).
- Both the website and extension should:
  - Check the backend for the user’s theme preference.
  - Fall back to system theme if no preference is set.
  - Allow the user to change the theme in either place, and update the backend.
- For unauthenticated users, use system theme and local storage.

---

## 2. “Backup the Contents of That in the Setting Section”

If you mean “let the user export or backup their settings (including theme)”, you can:
- Provide an export/import button in the settings page of both the website and extension.
- This can export settings as a JSON file.

---

## 3. Implementation Example

Would you like a code example for:
- Syncing theme between website and extension via backend?
- Detecting and applying system theme?
- Exporting/importing settings?

Let me know which part you want to see in detail, and I’ll provide the code!
