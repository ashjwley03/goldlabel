# GoldLabel App — Claude Instructions

## Security: Never commit secrets

**NEVER commit `.env`, `.env.local`, or any file containing:**
- Supabase keys (publishable or service role)
- Google Cloud Vision API keys
- Gemini API keys
- Any other API keys, tokens, or credentials

These files are in `.gitignore` for a reason. If you accidentally stage them, remove with `git restore --staged <file>` before committing.

When running upload/crop scripts that need a service key, read it from the environment or `.env` at runtime — never hardcode it in source files.

## Project structure

- `screens/` — React Native screens (Navigator defined in `App.tsx`)
- `components/` — Shared components (`PictogramData.tsx`, `PictogramGrid.tsx`)
- `utils/supabase.ts` — Supabase client (reads from `EXPO_PUBLIC_*` env vars)
- `backend/index.js` — Express backend
- `types.ts` — Shared TypeScript types

## Pictogram storage

Pictograms live in Supabase Storage bucket `pictograms` under path:
`v1/{lang_code}/{filename}`

Filename mapping is defined in `components/PictogramGrid.tsx` (`SCHEMA_ID_TO_FILENAME`).

Upload scripts are in `c:\Users\prith\Desktop\Prithvi\NUS\NSWS\GoldLabel\GoldLabel-v1\Pictograms\`.
Cropped source images are in `Pictograms/{Language}/cropped/`.

## EAS builds

- Profile: `preview` (Android APK, internal distribution)
- Run: `npx eas-cli build --profile preview --platform android --non-interactive --no-wait`
- Env vars for builds must be set in EAS dashboard or via `eas env:create`, not from `.env`
