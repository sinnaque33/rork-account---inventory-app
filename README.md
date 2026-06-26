# Account & Inventory App

Turkish warehouse/shipment management mobile app built with Expo (React Native).
Manages shipment boxes ("koli"), barcode scanning to add/remove inventory items,
and waybill ("irsaliye") creation.

See [PROJECT.md](PROJECT.md) for the full architecture reference and
[CLAUDE.md](CLAUDE.md) for contributor/agent guidance.

## Requirements

- Node.js 20+
- A development build (the project uses native modules such as `expo-camera`,
  `expo-secure-store`, and `expo-haptics`, so plain Expo Go is not sufficient —
  build a dev client once with EAS, then iterate over Metro).

## Getting started

```bash
npm install
npm start            # Expo dev server (tunnel)
npm run start-web    # Web preview
npm run lint         # ESLint (eslint-config-expo)
npx tsc --noEmit     # Type check (no test suite yet)
```

`npm start` runs `expo start --tunnel`. The tunnel uses `@expo/ngrok`
(already a dev dependency). For LAN/USB use `npx expo start` without `--tunnel`.

## Native runs / builds

```bash
npm run android      # native Android run
npm run ios          # native iOS run

eas build --profile development   # dev client
eas build --profile preview       # APK preview
eas build --profile production    # store build
```

## Configuration

The backend URL and company credentials are entered at runtime on the in-app
**Settings** screen (gear icon on the login screen) and persisted to
`AsyncStorage`. There is no `.env`; default API URL lives in
[contexts/ApiConfigContext.tsx](contexts/ApiConfigContext.tsx).
