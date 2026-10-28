# LASU Smart Campus Navigator

A mobile-first campus map and destination search for Lagos State University, Ojo. This first milestone provides an interactive MapLibre map and searches a small, source-linked place catalog. It does not provide routes, turn-by-turn navigation, indoor navigation, or live campus conditions.

## Requirements

- Node.js 20.19+ (the project was verified with Node.js 24)
- npm

## Installation and development

In PowerShell or another terminal, from the project directory:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The public OpenFreeMap style is configured as the default and does not require registration or an API key. An internet connection is needed to fetch the map style and tiles. Search works from the bundled place catalog.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` runs the Vitest unit tests for the campus-place catalog and search function.

## Map provider configuration

MapLibre GL JS renders the map. The provider settings are isolated in `src/lib/map-provider.ts`; the user interface does not contain the tile service URL.

The default style is OpenFreeMap Positron:

```text
https://tiles.openfreemap.org/styles/positron
```

To select another compatible MapLibre style, copy `.env.example` to `.env.local` and set the public style URL:

```dotenv
NEXT_PUBLIC_MAP_STYLE_URL=https://your-provider.example/style.json
```

Restart the dev server after changing environment configuration. Only put public style URLs in `NEXT_PUBLIC_*` variables; never put private credentials there. If the selected style requires a key, use an appropriately restricted public browser key and review that provider's terms. Confirm that the selected style provides the correct attribution metadata, which MapLibre displays on the map.

MapLibre reads and displays attribution from the selected style. The app uses the OpenFreeMap public instance by default, which currently documents public use without API keys or request limits. It is provided as-is, so production deployments should review the provider's current terms and consider self-hosting or a service with an SLA if availability guarantees are needed.

## Place data and verification

Place data and search are in `src/lib/campus-places.ts`. Each place carries an ID, category, coordinates, description, verification status, and source record. The starter catalog contains two OpenStreetMap-derived records. Both are explicitly `provisional`: they have not been confirmed by LASU, and the university campus point represents a campus feature rather than a building entrance. The data should only be marked `verified` after LASU confirms the place name and location.

## Known limitations

- The map and place search need an internet connection; there is no offline map cache.
- Search only covers the two bundled sample records. There is no geocoder or server-backed catalog.
- Place details are provisional and require review with LASU before operational use.
- Browser geolocation requires permission and a secure context (HTTPS, or localhost during development).
- The location button centers the map on the device's current coordinates; those coordinates are not sent to an application backend.
- No route calculation, directions, traffic, building access details, or live campus conditions are implemented.
