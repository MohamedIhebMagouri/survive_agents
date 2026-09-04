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

### Gemini BIA PDF reports

The BIA detail page uses the server-side Gemini SDK for controlled narrative content, then renders a deterministic 30-page report matching the BIA table of contents. Gemini returns validated JSON only; LaTeX and PDF layout are built by the application so user-provided content cannot alter the document structure. Configure `GEMINI_API_KEY` locally and in the Vercel project environment. The key must never use a `NEXT_PUBLIC_` prefix.

Company branding is selected from the process factory code or name. Optional logos and colors can be configured with a server-only JSON environment variable:

```dotenv
BIA_BRANDS_JSON={"delice":{"companyName":"Délice Holding","primaryColor":"#172a88","accentColor":"#78b82a","logoUrl":"https://company.example/logo.png"},"factory-code":{"companyName":"Company name","primaryColor":"#00236f","accentColor":"#006b5f","logoUrl":"https://company.example/logo.png"}}
```

Logo URLs must use HTTPS and return an image smaller than 2 MB. If no logo is configured, the report uses a text wordmark and the configured company colors.

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
