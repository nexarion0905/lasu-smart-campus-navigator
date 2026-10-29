# LASU Smart Campus Navigator

A mobile-first campus navigation project for Lagos State University (LASU). The current milestone provides an interactive map foundation, searchable destination listings, a selected-place details panel, and browser geolocation. It does not yet provide AI responses, route calculation, or voice-guided navigation. No LASU-verified campus destination dataset is available, so destination pins remain pending verification.

## Requirements

- Node.js 20.19+ (verified with Node.js 24)
- npm

## Installation and development

From the repository directory in PowerShell or another terminal:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. Search currently covers two source-linked OpenStreetMap records. They are marked provisional, and the app does not show them as map pins or zoom to their coordinates. Search, details, and the base map remain available while LASU-approved place data is pending.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Vitest tests cover the typed place model, verified-only map filtering, search behavior, empty datasets, map-style URL validation, and map error classification.

## Map provider configuration

MapLibre GL JS renders the map. Provider configuration is kept in `src/lib/map-provider.ts`. By default, the app uses the OpenFreeMap Positron style, which requires no API key:

```text
https://tiles.openfreemap.org/styles/positron
```

To use another compatible style, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_MAP_STYLE_URL`:

```dotenv
NEXT_PUBLIC_MAP_STYLE_URL=https://your-provider.example/style.json
```

Only HTTPS style URLs without embedded credentials are accepted. An absent or blank value uses the default style; an invalid value produces an accessible map configuration error. Never put private credentials in a `NEXT_PUBLIC_*` variable. If another provider requires a browser key, use a restricted public key and check its terms.

MapLibre displays attribution declared by the selected style. OpenFreeMap's public instance currently documents keyless public use and no request limits, but is offered as-is without an availability guarantee. Review the provider's current terms and availability before production use. Do not bulk-download or prefetch tiles unless the chosen provider explicitly permits it.

## Place data and verification

`src/lib/campus-places.ts` defines the typed place model and search. Verified places must include coordinates; provisional records can include sourced coordinates or `null`; unverified records have `null` coordinates. Only `verified` records with coordinates can be drawn or selected from map pins.

The starter catalog includes two OpenStreetMap-derived records. Their source records are linked in the selected-place panel, but neither has been confirmed by LASU. The university feature coordinate is an approximate area reference, not an entrance. The School of Transport and Logistics feature also needs LASU confirmation. Both records remain provisional, and neither is shown as a pin. Add LASU-approved and field-checked data before changing a record to `verified`.

## Known limitations

- Campus destination markers and map-driven destination zooming are pending LASU-verified coordinates.
- Search covers only the two provisional catalog records; it has no geocoder or server-backed dataset.
- The map and tiles require an internet connection; offline maps are not implemented.
- Browser geolocation requires permission and a secure context (HTTPS or localhost during development). Device coordinates are used only to center the browser map and are not sent to an application backend.
- Route calculation, turn-by-turn or voice guidance, AI responses, traffic, building access details, and live campus updates are not implemented.
