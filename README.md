# Survive UI Demo

Static front-end demonstration for **Survive**, a SaaS platform focused on business continuity, BCM/PCA, organizational resilience and crisis simulations.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Material Symbols
- Geist font

## Installation

```bash
npm install
npm run dev
```

The process-capture agent runs in Python. Use Python 3.10 or newer, ensure it is available as `python` on Windows (`python3` on Linux/macOS), and configure `GEMINI_API_KEY` in `.env`. Set `PYTHON_BIN` when the interpreter is installed under a custom command or path.

## Available Routes

- `/` or `/landing` - Landing page
- `/login` - Login page
- `/dashboard` - Dashboard
- `/simulation-room` - Simulation room
- `/logout` - Logout confirmation

## Demo Notes

- This project is a **static UI showcase** only.
- There is **no backend**, **no API**, **no database** and **no real authentication**.
- Navigation is intentionally simplified for presentation:
  - Landing -> Login
  - Login -> Dashboard
  - Dashboard -> Simulation Room
  - Dashboard / Topbar -> Logout
  - Logout -> Login or Dashboard

## Presentation Focus

Use the app to demonstrate the visual flow of Survive:

1. Public product positioning on the landing page
2. Professional sign-in experience
3. Executive dashboard with continuity KPIs
4. Crisis simulation control room
5. Premium logout confirmation
# survive-ui
