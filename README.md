# Malhar Archives Vault

A single React/Next.js vault-access module for Malhar 2021–2025. It presents one randomly selected MCQ as accessible radio cards, shuffles option order without changing answer identity, plays a staged physical unlock and themed zoom, then navigates to the configured archive-entry route.

## Approach

The supplied archive repository already used React and Next.js, so the rebuild stays inside that architecture. The module uses semantic React, CSS custom properties, CSS transforms, and shared mechanical components. No canvas, WebGL, extra animation library, result page, or archive placeholder is used.

## Structure

- `app/page.tsx` — vault screen route
- `app/globals.css` — shared mechanical system, five variants, responsive and reduced-motion styles
- `components/vault/VaultExperience.tsx` — quiz state, staged unlock, glowing interior, zoom and route handoff
- `components/vault/data.ts` — centralized years, archive URLs and 17 source MCQs
- `app/vault/[year]/page.tsx` — year-aware archive-entry result screen
- `components/vault/utils.ts` — injectable random question selection and Fisher–Yates option shuffle
- `tests/vault.test.ts` — deterministic configuration and randomization tests

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000/?year=2021` and change the year from the demo selector. Supported values are 2021–2025. An unsupported query value produces a recoverable message and leaves the selector available.

## Questions and answers

Years 2021–2023 have three supplied questions; 2024–2025 have four. Each question has four stable option IDs and a `correctOptionId`. `chooseQuestion` selects one bank entry per load and avoids an immediate repeat when alternatives exist; `shuffleOptions` returns a shuffled copy. Both accept an injected random function for deterministic tests.

The source DOCX omits the fourth printed option for 2025 Q1. This implementation restores the unambiguous missing answer, “The World Within,” so the question meets the four-option requirement. The source jumps from Q1 to Q3; those IDs are preserved.

## Vault comparison

| Year | Door geometry | Working motif | Bars/frame | Unlock signature |
|---|---|---|---|---|
| 2021 Parallax | Offset asymmetric lens plates | Six-blade aperture in hub | Straight gold spokes, offset rings | Layers align, aperture contracts |
| 2022 Aurora | Semicircular horizon panel | Sun disc in hub | Tapered ray spokes, pale steel | Horizon light and rays sequence |
| 2023 Eye of the Storm | Angular compass panel | Mechanical eye in hub | Alternating compass bars, counter-rings | Storm rings oppose, eye energizes |
| 2024 Viva La Vida | Wing/feather panel | Phoenix wings linked to hub | Feather-shaped covers, gold clamps | Feather seams light, wings release |
| 2025 The World Within | Deep nested circles | Triquetra in astrolabe hub | Antique-gold bars, double astrolabe rim | Celestial rings align, triquetra drives |

All variants retain a deep circular jamb, door edge, visible left hinges, radial bars, twelve circumference bolts, four clamps, side lock, and a dark passage behind the opened door.

## Theme system

Every year configuration includes a `pageClass`. The root vault page and `/vault/[year]` result route both apply that exact class, so one selected year controls the page background, brightness, text, console, vault metal, atmosphere, interior glow and result graphic. Theme tokens live in the five dedicated CSS sections: `theme-parallax`, `theme-aurora`, `theme-storm`, `theme-viva` and `theme-within`.

The shared components consume semantic variables such as `--page-background`, `--surface`, `--text-main`, `--text-muted`, `--accent`, `--glow`, `--vault-metal`, `--vault-highlight` and `--interior-core`. This prevents Parallax colors from leaking into the other years.

## Archive routes

Edit `archiveUrl` in `components/vault/data.ts`. Current handoff routes are `/vault/2021` through `/vault/2025`, as specified. The project does not create those archive pages. A missing route blocks navigation and reports an inline error.

## Unlock and accessibility

Correct and Skip use the same guarded sequence: activation → wheel → bars → bolts → hinged door → glowing interior → camera zoom → route. Controls disable immediately, preventing duplicate unlock calls. Radio cards remain keyboard-operable, feedback uses `aria-live`, focus is visible, and the layout stacks on smaller screens. `prefers-reduced-motion` substitutes a short fade for the long zoom.

## Tests

```bash
npm test
npm run build
```

The focused suite validates all five configurations, three questions per year, four unique options, valid correct IDs, deterministic selection and shuffle behavior, retained correct answers, and routes. Browser behavior was manually validated at desktop and mobile sizes; the project does not claim full code coverage.

## Add a year

Add a complete `VaultConfig` entry to `vaultData`, add a theme class and structural variant styles in `app/globals.css`, and extend the comparison table. Do not duplicate the page or quiz logic.

## GitHub initialization

```bash
git init
git add .
git commit -m "Build Malhar Archives mechanical vault module"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/YOUR-REPO.git
git push -u origin main
```
