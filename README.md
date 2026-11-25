# ERMap - North Bengaluru pilot

A mobile-first information aid for discovering published emergency-care facilities in North Bengaluru. Post-surgery and rehabilitation care remain future work.

## Trust rules

- In an emergency, call 112 or 108 first.
- ERMap is an information aid, not medical advice.
- ER beds mean reported emergency-department/casualty holding beds only. ICU and CCU are separate.
- A reported bed count must have an `er_beds_as_of` date. It is not live availability.
- Unverified facts must not be displayed as confirmed.
- Do not rank hospitals or make clinical-quality claims.
- Sample records must be clearly marked and must never be presented as real facilities.

## Requirements

- Node.js LTS and npm
- A **new** Supabase project for ERMap (not an existing personal or work project)
- A MapLibre-compatible map style URL; OpenFreeMap Liberty is used for the initial pilot

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app can start without Supabase credentials. ERMap currently uses a curated directory with source notes; Supabase is not connected to the landing page.

## Hospital records

The curated facility records live in `src/lib/hospital-directory.ts`. ER directory entries and map markers are derived only from records whose official or government sources confirm emergency care. Map-provider hospital labels and search results do not establish emergency availability. No `data/sample-hospitals.json` file or sample facility records are present in this checkout; verified records are not sample records.

Configure `NEXT_PUBLIC_MAP_STYLE_URL` in `.env.local` to enable the interactive map. The example file uses OpenFreeMap Liberty (`https://tiles.openfreemap.org/styles/liberty`), which does not require an API key for this initial implementation. If no style URL is configured, ERMap displays a setup message in place of the map. Review the provider's usage terms before increasing traffic.

## Place search

Place-name, locality, landmark and address search uses Photon (`photon.komoot.io`) with OpenStreetMap data, limited to the North Bengaluru pilot area. Searches are debounced, limited to six displayed results, and spaced by at least one second per browser session. Search results are map-provider results only and are not ERMap-verified facility records. Photon asks public demo users to keep request volume reasonable, may throttle or block extensive usage, and provides no availability guarantee. Search results display Photon and OpenStreetMap attribution. Review the [Photon demo server terms](https://github.com/komoot/photon#demo-server) before increasing traffic or using this for a wider audience.

The [About & Sources page](/about) explains the verification approach, field-level source dates and Photon search data. The search request includes the query text and fixed North Bengaluru bias parameters. Public Photon search is a demo service; review its current terms and privacy information before production-scale use.

## Public site metadata and contact

The site metadata, canonical URL, robots rules, sitemap, favicon and social preview use `https://www.ermap.in`. Configure that domain and TLS at the hosting provider before publishing under the canonical URL. ERMap contact details are not configured; the site states this instead of advertising an unconfigured email address.

## Supabase setup

1. Create a new project named `ermap-pilot` only after confirming region, plan and any possible charges.
2. Confirm PostGIS is available in the project.
3. Review `supabase/migrations/202611210001_initial_schema.sql`.
4. Apply it through the Supabase SQL editor or Supabase CLI.
5. Keep the service-role key out of `.env.local` and all browser code. Do not commit secrets.
6. Configure the public project URL and anon/publishable key in `.env.local`.

No live Supabase project has been created and no migration has been applied by this starter.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser-safe anon/publishable key
- `NEXT_PUBLIC_MAP_STYLE_URL`: style URL from the selected tile provider

Never expose a service-role key to the browser or commit it.

## Migration notes

The migration includes `is_sample`, explicit RLS enablement for every table, and intentionally denies public access to family reports and verification logs. Public directory reads are restricted to sample or verified records. Confirm the PostGIS extension schema in the target Supabase project before applying.

This is a starter migration, not a substitute for a security review or live database test.

## Current milestone status

- [x] Project scaffold and environment template
- [x] Emergency-care discovery with an interactive North Bengaluru map and sourced ER facility records
- [x] Place and locality search with Care For and ownership filters
- [x] Hospital detail panel with published contacts, directions and confirmation notes
- [ ] Configure Supabase (not configured)
- [ ] Add rehabilitation and after-surgery care (future milestone)
