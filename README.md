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

## Génération du rapport BIA

Le rapport est généré côté serveur à partir de données déjà renseignées. Le chemin ne fait aucun appel Gemini. La source recommandée est le JSON structuré validé par `lib/bia/analysis-schema.ts`; un export XLSX est aussi accepté, avec une feuille par section et la première ligne utilisée comme en-têtes.

L’extraction de documents (`POST /api/extract`) utilise désormais `python/document_extraction_agent.py`, appelé depuis Node.js par stdin/stdout JSON, comme l’agent de capture de processus. Node.js conserve uniquement la lecture locale du texte et la validation du fichier ; Python porte l’appel Gemini et la normalisation des champs. Le paquet `google-genai` doit donc être installé dans l’environnement Python indiqué par `PYTHON_BIN`.

`POST /api/generate-bia-report` accepte :

- un multipart avec le champ `file` (`.json`, `.xlsx` ou `.xls`);
- un JSON `{ "reportId": "..." }` ou `{ "processId": "..." }` pour lire la base;
- un JSON `{ "source": { ... }, "config": { "companyName": "...", "logoText": "...", "primaryColor": "#052b73" } }`.

Les champs absents sont rendus `[à compléter]` et la liste des sections incomplètes est disponible dans le résultat de lecture. `pdfkit` est conservé ici plutôt que Puppeteer ou `@react-pdf/renderer` : il fonctionne directement dans une route Node.js, n’impose pas de navigateur headless et permet de répéter précisément l’en-tête, le pied de page et les lignes de tableaux sur des pages A4. Puppeteer serait préférable pour une maquette HTML/CSS pixel-perfect, au prix d’un navigateur à déployer ; `@react-pdf/renderer` est plus déclaratif mais moins adapté aux tableaux très larges et aux contraintes de pagination de ce modèle.
