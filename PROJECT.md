# Account & Inventory App

Turkish warehouse/shipment management mobile application built with Expo (React Native). Manages shipment boxes ("koli"), barcode scanning, waybill ("irsaliye") creation, inventory items, and current accounts.

**Built with:** [Rork](https://rork.com) AI-powered app builder.

## Tech Stack

| Category           | Technology                          |
|--------------------|-------------------------------------|
| Framework          | React Native 0.81.5                 |
| Platform           | Expo SDK 54                         |
| Routing            | Expo Router (file-based)            |
| Language           | TypeScript 5.9                      |
| State (server)     | @tanstack/react-query 5.90          |
| State (client)     | zustand 5                           |
| State (context)    | @nkzw/create-context-hook           |
| Forms/Validation   | zod 4                               |
| i18n               | i18next + react-i18next             |
| Icons              | lucide-react-native                 |
| Storage            | @react-native-async-storage/async-storage |
| Secure Storage     | expo-secure-store                   |
| Sound              | expo-av                             |

## Project Structure

```
├── app/                    # Expo Router screens (main source)
│   ├── _layout.tsx         # Root layout with providers
│   ├── +native-intent.tsx  # Native intent handler
│   ├── +not-found.tsx      # 404 page
│   ├── index.tsx           # Entry - redirects to /login
│   ├── login.tsx           # Login screen
│   ├── settings.tsx        # API settings screen
│   ├── (app)/              # Authenticated app group
│   │   ├── _layout.tsx     # App tab layout
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── accounts.tsx    # Current accounts list
│   │   ├── inventory.tsx   # Inventory items list
│   │   ├── koli-listesi.tsx        # Box list with selection
│   │   ├── koli-detay.tsx          # Box detail with barcode scan
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
│   └── sounds/error_1.mp3  # Error beep
├── constants/
│   ├── colors.ts           # Color theme
│   └── sounds.ts           # Sound references
├── contexts/
│   ├── ApiConfigContext.tsx # API URL & company config
│   └── AuthContext.tsx      # Auth state management
├── locales/
│   ├── i18n.ts             # i18next setup (Turkish default)
│   ├── tr.json             # Turkish translations
│   └── en.json             # English translations
├── services/
│   ├── api.ts              # All API calls (~1320 lines)
│   └── types.ts            # TypeScript type definitions
├── utils/
│   └── imageUtils.ts       # Byte array to base64 converter
├── package.json
├── app.json                # Expo config
├── tsconfig.json
├── eas.json                # EAS Build config
├── metro.config.js
└── eslint.config.js
```

## Navigation (Expo Router)

```
/ (index.tsx) --> redirects to /login
/login
/settings
/(app)/dashboard         # Main dashboard
/(app)/accounts          # Current accounts (cari hesaplar)
/(app)/inventory         # Inventory items
/(app)/koli-listesi      # Box list (multi-select for bulk waybill)
/(app)/koli-detay        # Box detail (barcode add/delete items)
/(app)/create-koli       # Create box options
/(app)/order-receipts    # Select order receipt
/(app)/irskoli-listesi   # Waybill creation from boxes
/(app)/barcode-scanner   # Multi-mode barcode scanner
```

## Authentication Flow

1. Boot -> check stored token via `api.auth.checkAuth()`
2. Token exists -> restore user from `AsyncStorage` -> `/dashboard`
3. No token -> `/login`
4. Login calls `POST {apiBaseUrl}/Login` with username, password, licenseKey `16016923`, companyCode, companyPassword
5. Success -> store token in `SecureStore` (mobile) / `localStorage` (web), user in `AsyncStorage`

## API Communication

All calls via `/services/api.ts`. Two main endpoints:

1. **`{apiBaseUrl}/Login`** — authentication
2. **`{apiBaseUrl}/RunJsonService`** — generic service (accounts, inventory, box lists, order receipts, forms, barcode search). The `data` field contains a JSON string with a `name` key identifying the service.
3. **`{apiBaseUrl}Ex/CreateShipmentBoxService`** — box CRUD + waybill creation

Default `apiBaseUrl`: `https://webstreme.uniteks.com.tr:8001/ExtWsLiveV2/Services`

### API Object Structure

```typescript
api.auth.login(credentials)              // POST /Login
api.auth.logout()                        // Clear token locally
api.auth.checkAuth()                     // Check token exists

api.accounts.getList()                   // RunJsonService name: "accounts"
api.inventory.getList()                  // RunJsonService name: "inventory"

api.koliListesi.getList(page, search)    // RunJsonService name: "koliListesi"
api.koliListesi.irsKoliListesi(search)   // RunJsonService name: "irsKoliListesi"
api.koliListesi.getDetail(id)            // RunJsonService name: "koliDetay"
api.koliListesi.addItemByBarcode(boxId, barcode, ...)
api.koliListesi.deleteItemByBarcode(boxId, barcode, ...)
api.koliListesi.createKoliFromOrderReceipt(receipt, ...)
api.koliListesi.createReceipt(boxId, ...)
api.koliListesi.createReceipts(boxIds[], ...)
api.koliListesi.openBox(boxId)
api.koliListesi.closeBox(boxId, grossWeight, netWeight)
api.koliListesi.getBarcodeForms()        // RunJsonService name: "koliFormlari"
api.koliListesi.printBarcode(recId, formId)
api.koliListesi.getKoliDetailByBarcode(barcode)
```

### RunJsonService Request Shape

```json
{
  "data": "{\"name\":\"koliListesi\",\"page\":1,\"search\":\"\"}",
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
| `CurrentAccount`        | `CurrentAccountCode`, `CurrentAccountName`                              |
| `InventoryItem`         | `InventoryCode`, `InventoryName`, `Thumbnail` (byte array)              |
| `KoliItem`              | `id`, `PackageNo`, `Explanation`, `ReceiptNo?`, `SipExp?`               |
| `KoliDetailItem`        | `InventoryName`, `Quantity`, `Thumbnail?`                               |
| `OrderReceipt`          | `RecId`, `ReceiptNo`, `CurrentAccountName`                              |
| `BarcodeForm`           | `Name`, `Description?`                                                  |
| `RunJsonServiceResponse<T>` | `success`, `msg`, `ticket`, `data: T`                               |

## State Management

| Context/Store     | File                        | Provides                                                        |
|-------------------|-----------------------------|-----------------------------------------------------------------|
| `AuthContext`     | `contexts/AuthContext.tsx`  | `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `isLoggingIn`, `credentials` |
| `ApiConfigContext`| `contexts/ApiConfigContext.tsx` | `apiBaseUrl`, `companyCode`, `companyPassword`, `warehouseCode`, `errorSound`, `useExistingBox`, `printerName`, update functions, `resetToDefault()` |

All config persisted via `AsyncStorage`. Auth token stored via `SecureStore` / `localStorage`.

## Barcode Scanner Modes

Defined in `app/(app)/barcode-scanner.tsx`:

- `create_from_order` — Create new box from an order receipt
- `create_standalone` — Create standalone box (no order)
- `add` — Add item to existing box by barcode
- `delete` — Remove item from existing box by barcode
- `search` — Find box by barcode and navigate to detail

## i18n

- Default: Turkish (`tr`), fallback: Turkish
- English (`en`) also supported
- Language stored in `AsyncStorage` under key `appLanguage`
- Translation files: `locales/tr.json`, `locales/en.json`

## Running the Project

```bash
npm start        # Expo dev server with Rork tunnel
npm run start-web # Web preview
npm run lint     # ESLint
```

## EAS Build

```bash
eas build --profile development  # Dev client
eas build --profile preview      # APK preview
eas build --profile production   # Store build
```

## Bundle IDs

- iOS: `app.rork.account-inventory-app`
- Android: `app.rork.account_inventory_app`
- Deep link scheme: `rork-app`

## Key Dependencies

- `@rork-ai/toolkit-sdk` — Rork platform SDK
- `@ai-sdk/react` — AI SDK hooks
- `zustand` — Lightweight state
- `@tanstack/react-query` — Server state / caching
- `expo-secure-store` — Secure credential storage
- `expo-av` — Audio playback (error beep)
- `lucide-react-native` — Icon library

## Important Notes

- All API endpoints expect a `licenseKey: "16016923"` parameter
- Image thumbnails come as byte arrays from the API and are converted to base64 via `utils/imageUtils.ts`
- The `koli-detay.tsx` screen is the most complex (1481 lines) handling dynamic fields with `h1_*`, `h2_*`, `sh_*` key prefixes
- Bulk waybill creation in `koli-listesi.tsx` uses long-press to enter multi-selection mode
- Toast notifications via `react-native-toast-message`
- Navigation stack manipulation uses `CommonActions.reset()` in barcode scanner
