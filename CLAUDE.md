# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Turkish warehouse/shipment management mobile app (Expo / React Native, file-based Expo Router). Core domain is shipment boxes ("koli"), barcode scanning to add/remove inventory items, and waybill ("irsaliye") creation. UI strings and most code comments are Turkish.

`PROJECT.md` is an accurate, detailed reference (structure, navigation map, data models, scanner modes). Read it for the big picture. **`API_INTEGRATION.md` is stale boilerplate that describes a generic REST API that was never built — ignore it; the real API is described below.**

## Commands

```bash
npm start          # Expo dev server via Rork tunnel (bunx rork start ... --tunnel)
npm run start-web  # Web preview
npm run lint       # expo lint (eslint-config-expo, flat config)
npm run android    # native Android run
npm run ios        # native iOS run
```

There is **no test suite** and no typecheck script — run `npx tsc --noEmit` if you need type checking (tsconfig is `strict`). The dev server requires the Rork project id baked into the `start` scripts; it is not a plain `expo start`.

## API layer — the central abstraction

Everything network-related lives in [services/api.ts](services/api.ts). There is no per-screen fetching scattered around; screens call `api.*` methods through React Query. Key conventions that are easy to get wrong:

- **Three endpoints, not REST.** Every call hits one of:
  - `{apiBaseUrl}/Login` — auth
  - `{apiBaseUrl}/RunJsonService` — all *reads* (accounts, inventory, box lists, order receipts, forms, barcode lookup). The service is selected by a JSON **string** in the `data` field: `data: '{ "name": "koliListesi", "id": "..." }'`.
  - `{apiBaseUrl}Ex/CreateShipmentBoxService` — all box *writes* (add/delete item, open/close box, create box, create receipt). Note: no slash before `Ex` — it concatenates onto the base URL.
- **Every request body repeats credentials**: `userName`, `password`, `companyCode`, `companyPassword`, `licenseKey: "16016923"` (hardcoded), usually `logout: true`. `userName`/`password` are passed in from the calling screen (sourced from `useAuth().user`), not read globally.
- **`success` is the string `"true"`**, not a boolean — check `data.success === "true"`. Errors are also signalled by numeric `err` (e.g. `err === 99`) and `resultErrorType` codes.
- **Responses are doubly-encoded.** Write endpoints frequently return a `data` field that is itself a JSON string needing a second `JSON.parse`, with result fields appearing under varying names (`resultBoxId` / `boxId` / `RecId`, `resultBoxCode` / `PackageNo`). The existing methods defensively probe multiple keys — mirror that pattern when adding methods.
- Config values (`apiBaseUrl`, `companyCode`, `companyPassword`, `warehouseCode`) are read from `AsyncStorage` and **module-level cached**; `clearApiUrlCache()` must be called after any config write (ApiConfigContext already does this). `warehouseCode` defaults to `"3"`.

## State & auth flow

- **Server state**: React Query (`QueryClientProvider` in [app/_layout.tsx](app/_layout.tsx)).
- **App config & auth**: two context hooks built with `@nkzw/create-context-hook`, not Redux/zustand despite zustand being a dependency:
  - [contexts/ApiConfigContext.tsx](contexts/ApiConfigContext.tsx) — API URL, company creds, warehouse code, error sound, `useExistingBox`, printer name. All persisted to `AsyncStorage`.
  - [contexts/AuthContext.tsx](contexts/AuthContext.tsx) — user object + login/logout mutations. The logged-in `user` holds the raw `userName`/`password`, which are then threaded into every `api.*` call.
- **Token storage is platform-split**: `SecureStore` on native, `localStorage` on web (see `tokenStorage` in api.ts). Same split logic appears in a few places.
- **Navigation is imperative, not declarative guards.** Auth redirects happen in `NavigationHandler` inside [app/_layout.tsx](app/_layout.tsx): mutations set a `pendingNavigation` string in AuthContext, and a `useEffect` calls `router.replace`. When adding auth-gated flows, push to `pendingNavigation` rather than navigating directly inside the mutation. The `(app)` route group is the authenticated area; being in it while unauthenticated triggers a redirect to `/login`.

## Conventions

- Path alias `@/*` maps to the repo root (e.g. `@/services/api`, `@/contexts/AuthContext`).
- New screens are files under [app/](app/) (Expo Router, `typedRoutes` experiment is on). Authenticated screens go in `app/(app)/` and must be registered in [app/(app)/_layout.tsx](app/(app)/_layout.tsx); titles use `t('navigation.*')`.
- All user-facing text goes through i18next (`useTranslation`). Add keys to **both** [locales/tr.json](locales/tr.json) and [locales/en.json](locales/en.json); default/fallback language is Turkish.
- Theme colors come from [constants/colors.ts](constants/colors.ts) — don't hardcode hex values.
- Image thumbnails arrive as byte arrays and are converted via [utils/imageUtils.ts](utils/imageUtils.ts).
- [app/(app)/barcode-scanner.tsx](app/(app)/barcode-scanner.tsx) is multi-mode (`create_from_order`, `create_standalone`, `add`, `delete`, `search`) driven by a route param; it manipulates the navigation stack with `CommonActions.reset()`.
