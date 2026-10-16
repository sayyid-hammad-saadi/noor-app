# Noor

Prayer · Quran · Ramadan, an Expo (SDK 56) app with Expo Router, TypeScript strict, light/dark themes and Bangla / English / Arabic (RTL).

## Run on Android (development build)

```bash
pnpm install
pnpm android          # npx expo run:android: builds and installs the dev client, starts Metro
```

After the dev client is installed, day-to-day you only need:

```bash
pnpm start            # expo start --dev-client
```

Without a local Android SDK, build the dev client in the cloud instead:

```bash
npx eas-cli@latest build --profile development --platform android
```

## Scripts

| script           |                                                      |
| ---------------- | ---------------------------------------------------- |
| `pnpm lint`      | ESLint (expo config + Prettier + colour-literal ban) |
| `pnpm typecheck` | `tsc --noEmit`                                       |
| `pnpm doctor`    | `expo-doctor`                                        |

## Layout

```
src/app/          routes (Expo Router)
src/features/     feature screens, components, hooks, data
src/components/   shared ui / layout / feedback / media components
src/theme/        tokens (palette, metrics, typography, fonts), ThemeProvider
src/i18n/         i18next setup, locales, numerals, RTL
src/lib/          storage and other helpers
```

The entry route currently shows the shared component gallery (`src/features/dev`), with language and appearance switches, until the real screens are built.
