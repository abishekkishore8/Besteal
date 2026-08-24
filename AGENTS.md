# BESTEAL Reverse Marketplace Architecture

Full-stack application structured into 3 dedicated sub-projects:

## Project Structure

- `backend/` - Express REST API Server (port 5000) with file-backed JSON database engine (`backend/data/db.json`).
- `website/` - Customer & Seller Web Portal + Enterprise Admin Console built with React + Vite + Tailwind CSS v4 (port 8443).
- `mobileapp/` - Mobile App for Buyers and Sellers running in iOS device simulation built with React + Vite + Tailwind CSS v4 (port 8445).

## Running the Application

In the root directory, run:
- `npm run dev` - Starts `backend`, `website`, and `mobileapp` concurrently.
- `npm run dev:backend` - Starts Express API server on `http://localhost:5000`
- `npm run dev:website` - Starts Website Portal on `http://localhost:8443`
- `npm run dev:mobile` - Starts Mobile App on `http://localhost:8445`

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
