# Account & Inventory App

Turkish warehouse/shipment management mobile application built with Expo (React Native). Manages shipment boxes ("koli"), barcode scanning, and waybill ("irsaliye") creation.

## Tech Stack

| Category           | Technology                          |
|--------------------|-------------------------------------|
| Framework          | React Native 0.81.5                 |
| Platform           | Expo SDK 54                         |
| Routing            | Expo Router (file-based)            |
| Language           | TypeScript 5.9                      |
| State (server)     | @tanstack/react-query 5.90          |
| State (context)    | @nkzw/create-context-hook           |
| Theme              | custom token system (`constants/theme.ts`) + `ThemeContext` (dark/light) |
| i18n               | i18next + react-i18next             |
| Icons              | lucide-react-native                 |
| Storage            | @react-native-async-storage/async-storage |
| Secure Storage     | expo-secure-store                   |
| Sound              | expo-av (deprecated in SDK 54 — migrate to `expo-audio` eventually) |

> `zod` and `zustand` are installed but currently unused by app code.

## Project Structure

```
├── app/                    # Expo Router screens (main source)
│   ├── _layout.tsx         # Root layout: providers + NavigationHandler + splash gating
│   ├── +native-intent.tsx  # Deep-link path handler (returns path as-is)
│   ├── +not-found.tsx      # 404 page (themed + i18n)
│   ├── index.tsx           # Entry - auth-aware redirect (dashboard | login)
│   ├── login.tsx           # Login screen
│   ├── settings.tsx        # API / company / theme / language settings
│   ├── (app)/              # Authenticated app group
│   │   ├── _layout.tsx     # App stack layout (registers authenticated screens)
│   │   ├── dashboard.tsx   # Main dashboard (2 cards: box list, create waybill)
│   │   ├── koli-listesi.tsx        # Box list with multi-select
│   │   ├── koli-detay.tsx          # Box detail with barcode add/delete
│   │   ├── create-koli.tsx         # Create box options
│   │   ├── order-receipts.tsx      # Order receipt selection
│   │   ├── irskoli-listesi.tsx     # Waybill creation from boxes
│   │   └── barcode-scanner.tsx     # Multi-mode barcode scanner
│   └── components/         # Shared UI components
│       ├── ActionButton.tsx
│       ├── PrintBarcodeModal.tsx
│       ├── ReceiptConfirmModal.tsx
│       └── ResultModal.tsx
├── assets/
│   ├── images/             # App icons
│   ├── *.png               # Extreme brand logos (light/dark)
│   └── sounds/error_1.mp3  # Error beep
├── constants/
│   ├── theme.ts            # Design tokens: colors (dark/light), spacing, radius, type
│   ├── colors.ts           # Legacy palette (unused — superseded by theme.ts)
│   └── sounds.ts           # Sound references
├── contexts/
│   ├── ApiConfigContext.tsx # API URL & company config & app preferences
│   ├── AuthContext.tsx      # Auth state management
│   └── ThemeContext.tsx     # Dark/light theme mode (persisted)
├── hooks/
│   └── useSafeNavigation.ts # Debounced push/replace (prevents double navigation)
├── locales/
│   ├── i18n.ts             # i18next setup (Turkish default, persists language)
│   ├── tr.json             # Turkish translations
│   └── en.json             # English translations
├── services/
│   ├── api.ts              # All API calls
│   └── types.ts            # TypeScript type definitions
├── utils/
│   └── imageUtils.ts       # Byte array to base64 converter
├── package.json
├── app.json                # Expo config
├── tsconfig.json
├── eas.json                # EAS Build config
├── metro.config.js         # Plain Expo Metro config
└── eslint.config.js
```

## Navigation (Expo Router)

```
/ (index.tsx) --> auth-aware: authenticated -> /(app)/dashboard, else -> /login
/login
/settings
/(app)/dashboard         # Main dashboard
/(app)/koli-listesi      # Box list (multi-select for bulk waybill)
/(app)/koli-detay        # Box detail (barcode add/delete items)
/(app)/create-koli       # Create box options
/(app)/order-receipts    # Select order receipt
/(app)/irskoli-listesi   # Waybill creation from boxes
/(app)/barcode-scanner   # Multi-mode barcode scanner
```

## Authentication Flow

1. Boot -> `AuthContext` checks stored token via `api.auth.checkAuth()`; if a token
   and a stored user exist, the user object is restored from `AsyncStorage`.
2. The splash screen stays visible until the auth check finishes (`isLoading`).
3. `index.tsx` then redirects: authenticated -> `/(app)/dashboard`, otherwise -> `/login`.
4. Login calls `POST {apiBaseUrl}/Login` with username, password, licenseKey `16016923`, companyCode, companyPassword.
5. Success -> store token in `SecureStore` (mobile) / `localStorage` (web), user in `AsyncStorage`, then navigate to dashboard.
6. Logout clears the token + stored user and returns to `/login`. Being inside the
   `(app)` group while unauthenticated triggers a redirect to `/login`.

## API Communication

All calls via `/services/api.ts`. Three endpoints:

1. **`{apiBaseUrl}/Login`** — authentication
2. **`{apiBaseUrl}/RunJsonService`** — generic reads (box lists, order receipts, forms, barcode lookup). The `data` field contains a JSON string with a `name` key identifying the service.
3. **`{apiBaseUrl}Ex/CreateShipmentBoxService`** — box CRUD + waybill creation (note: no slash before `Ex`).

Default `apiBaseUrl`: `https://webstreme.uniteks.com.tr:8001/ExtWsLiveV2/Services`

### API Object Structure

```typescript
api.auth.login(credentials)              // POST /Login
api.auth.logout()                        // Clear token locally
api.auth.checkAuth()                     // Check token exists

api.koliListesi.getList(...)             // RunJsonService name: "koliListesi"
api.koliListesi.irsKoliListesi(...)      // RunJsonService name: "irsKoliListesi"
api.koliListesi.getDetail(id)            // RunJsonService name: "koliDetay"
api.koliListesi.addItemByBarcode(boxId, barcode, ...)
api.koliListesi.deleteItemByBarcode(boxId, barcode, ...)
api.koliListesi.createKoliFromOrderReceipt(receipt, ...)
api.koliListesi.createReceipt(boxId, ...)
api.koliListesi.createReceipts(boxIds[], ...)
api.koliListesi.getOrderReceipts(...)    // RunJsonService name: "orderReceipts"
api.koliListesi.openBox(boxId)
api.koliListesi.closeBox(boxId, grossWeight, netWeight)
api.koliListesi.getBarcodeForms()        // RunJsonService name: "koliFormlari"
api.koliListesi.printBarcode(recId, formName, printerName)
api.koliListesi.getKoliDetailByBarcode(barcode)  // name: "koliDetayWithBarcode"
```

### RunJsonService Request Shape

```json
{
  "data": "{\"name\":\"koliListesi\",\"id\":\"...\"}",
  "userName": "...",
  "password": "...",
  "licenseKey": "16016923",
  "companyCode": "...",
  "companyPassword": "...",
  "logout": true
}
```

## Data Models (key types from `services/types.ts`)

| Type                    | Key Fields                                                              |
|-------------------------|-------------------------------------------------------------------------|
| `LoginResponse`         | `success`, `token`, `ticket`, `uid`, `firstName`, `lastName`, `company`, `wh`, `ca`, `dept` |
| `KoliItem`              | `id`, `PackageNo`, `Explanation`, `ReceiptNo?`, `SipExp?`               |
| `KoliDetailItem`        | `InventoryName`, `Quantity`, `Thumbnail?`                               |
| `OrderReceipt`          | `RecId`, `ReceiptNo`, `CurrentAccountName`                              |
| `BarcodeForm`           | `Name`, `Description?`                                                  |
| `RunJsonServiceResponse<T>` | `success`, `msg`, `ticket`, `data: T`                               |

## State Management

| Context           | File                            | Provides                                                        |
|-------------------|---------------------------------|-----------------------------------------------------------------|
| `AuthContext`     | `contexts/AuthContext.tsx`      | `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `isLoggingIn`, `credentials`, `pendingNavigation` |
| `ApiConfigContext`| `contexts/ApiConfigContext.tsx` | `apiBaseUrl`, `companyCode`, `companyPassword`, `warehouseCode`, `errorSound`, `useExistingBox`, `skipWeightInput`, `printerName`, `updateConfig()`, per-field updaters, `resetToDefault()` |
| `ThemeContext`    | `contexts/ThemeContext.tsx`     | `theme`, `themeMode`, `isDark`, `setThemeMode()`, `toggleTheme()` |

Server state is React Query (`QueryClientProvider` in `app/_layout.tsx`). All config
persisted via `AsyncStorage`; auth token via `SecureStore` / `localStorage`.

## Barcode Scanner Modes

Defined in `app/(app)/barcode-scanner.tsx`, driven by a `mode` route param:

- `create_from_order` — Create new box from an order receipt
- `create_standalone` — Create standalone box (no order)
- `add` — Add item to existing box by barcode
- `search` — Find box by barcode and navigate to detail

(Item deletion is handled inside `koli-detay.tsx` via its own add/delete toggle, not
through the scanner screen.)

## i18n

- Default & fallback: Turkish (`tr`); English (`en`) also supported.
- Language stored in `AsyncStorage` under key `appLanguage` (auto-persisted by i18next on change).
- Translation files: `locales/tr.json`, `locales/en.json` — add keys to **both**.

## Running the Project

```bash
npm install
npm start         # expo start --tunnel
npm run start-web # web preview
npm run lint      # ESLint
npx tsc --noEmit  # type check (no test suite)
```

The project uses native modules (camera, secure-store, haptics), so use a **dev
client build**, not plain Expo Go.

## EAS Build

```bash
eas build --profile development  # Dev client
eas build --profile preview      # APK preview
eas build --profile production   # Store build
```

## Bundle IDs

- iOS: `com.extreme.inventory`
- Android: `com.extreme.inventory`
- Deep link scheme: `extreme-inventory`

## Important Notes

- All API endpoints expect a `licenseKey: "16016923"` parameter (hardcoded).
- `success` is the **string** `"true"`, not a boolean. Errors also use numeric `err`
  and `resultErrorType` codes; write responses are often doubly-encoded JSON.
- Image thumbnails come as byte arrays from the API and are converted to base64 via `utils/imageUtils.ts`.
- `koli-detay.tsx` is the most complex screen, handling dynamic fields with `h1_*`, `h2_*`, `sh_*` key prefixes.
- Bulk waybill creation in `koli-listesi.tsx` uses long-press to enter multi-selection mode.
- Toast notifications are custom (`Animated` + `ResultModal`), not a third-party library.
- Navigation stack manipulation uses `CommonActions.reset()` in the barcode scanner.
- This project is **not** tied to any external app builder; it is a plain Expo project.
```
