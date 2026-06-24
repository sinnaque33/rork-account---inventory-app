---
version: alpha
name: Extreme-design-analysis
description: "An original dark-operational design system for Extreme Business Solutions — a warehouse / shipment ('koli' & 'irsaliye') mobile terminal app. The surface is a neutral near-black canvas (#0C0B0D) holding light type, where the brand's Extreme Red (#DA2128, the scarlet of the logo's 'X' chevron) is the single brand voltage — used scarcely on the primary CTA, the active tab, the scan trigger, and the chevron motif. The system fuses Ferrari's dark-canvas + scarce-red-voltage architecture, IBM Carbon's complete semantic palette and IBM Plex Mono for codes/quantities/barcodes, Linear's shadowless surface-ladder hierarchy, and Revolut's mobile pill-and-rounded-card touch ergonomics. Because the brand is red, alert/error states are red by nature; action-red and alert-red are disambiguated by SCALE and MOTION — alerts are full-bleed flashes paired with an icon and the error sound, while brand-red actions stay contained in buttons and thin accents. Success is the one protected signal: it is always green and never red. Indigo (#5B5BF0) lives as a restrained secondary/info accent. Type runs Inter for all UI, Space Grotesk for display/login moments (echoing the geometric logo letterforms), and JetBrains Mono for tabular codes."

colors:
  # --- Brand (Extreme Red — the logo 'X' chevron) ---
  primary: "#DA2128"
  primary-bright: "#F23643"
  primary-deep: "#9E1318"
  primary-press: "#7C0F14"
  on-primary: "#ffffff"
  primary-tint: "#2A1316"          # red-tinted surface for selected/active rows on dark
  primary-ring: "#F23643"          # focus ring / scan-frame stroke

  # --- Ink (text on dark) ---
  ink: "#F6F6F7"
  ink-muted: "#A6A4AB"
  ink-subtle: "#76747C"
  ink-tertiary: "#54525A"
  ink-disabled: "#403E45"

  # --- Canvas & surface ladder (neutral near-black, a whisper warm) ---
  canvas: "#0C0B0D"
  surface-1: "#161518"
  surface-2: "#1E1C21"
  surface-3: "#26242A"
  surface-4: "#2E2B32"
  hairline: "#2B2930"
  hairline-strong: "#3A3742"
  scrim: "rgba(0,0,0,0.66)"

  # --- Inverse (light surfaces: print preview, receipts, barcode labels) ---
  inverse-canvas: "#FFFFFF"
  inverse-surface-1: "#F5F5F6"
  inverse-surface-2: "#ECECEE"
  inverse-ink: "#161518"
  inverse-ink-muted: "#5A5860"
  inverse-hairline: "#E2E2E5"

  # --- Semantic ---
  success: "#23C277"
  success-deep: "#159C5B"
  on-success: "#06130C"
  success-tint: "#0E2419"          # success toast / row wash on dark

  error: "#FF3340"                 # hot alert red — brighter than brand crimson
  error-deep: "#B0121C"
  on-error: "#ffffff"
  error-tint: "#2A1013"            # error toast / row wash on dark

  warning: "#F5A524"
  warning-deep: "#B5740C"
  on-warning: "#1A1304"
  warning-tint: "#2A2008"

  info: "#5B5BF0"                  # indigo — restrained secondary / info / links
  info-deep: "#3E3EC4"
  on-info: "#ffffff"
  info-tint: "#16162E"

  # --- Data signal (stock / quantity deltas — Binance up/down language) ---
  stock-in: "#23C277"
  stock-out: "#FF3340"

  # --- Box (koli) status ---
  status-open: "#F5A524"           # box open / in progress (amber)
  status-closed: "#23C277"         # box closed / completed (green)
  status-shipped: "#5B5BF0"        # waybill created / shipped (indigo)
  status-empty: "#76747C"          # empty / draft (subtle)

typography:
  display-xl:
    fontFamily: "Space Grotesk, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: -0.8px
  display-lg:
    fontFamily: "Space Grotesk, Inter, system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: -0.6px
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.3px
  screen-title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.2px
  card-title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.1px
  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0.1px
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: 0.6px
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: 0.1px
  mono-lg:
    fontFamily: "JetBrains Mono, IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0.5px
  mono:
    fontFamily: "JetBrains Mono, IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0.3px
  mono-sm:
    fontFamily: "JetBrains Mono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0.2px

rounded:
  xs: 6px
  sm: 8px
  md: 10px
  lg: 14px
  xl: 18px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  gutter: 16px

components:
  # --- Navigation ---
  top-app-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.screen-title}"
    height: 56px
    padding: 0 16px
  bottom-tab-bar:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    height: 64px
    borderTop: "1px {colors.hairline}"
  bottom-tab-active:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"

  # --- Buttons ---
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 20px
    minHeight: 48px
  button-primary-pressed:
    backgroundColor: "{colors.primary-press}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 20px
    minHeight: 48px
    border: "1px {colors.hairline-strong}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    minHeight: 44px
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 20px
    minHeight: 48px
  button-disabled:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-disabled}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"

  # --- Scan trigger (the protagonist action) ---
  scan-fab:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    size: 64px
    shadow: "0 6px 20px rgba(218,33,40,0.35)"
  scan-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    minHeight: 56px

  # --- Lists & cards ---
  list-row:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 14px 16px
    minHeight: 64px
    border: "1px {colors.hairline}"
  list-row-pressed:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
  list-row-selected:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    leftAccent: "3px {colors.primary}"
  card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 16px
    border: "1px {colors.hairline}"
  card-elevated:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 16px
    border: "1px {colors.hairline-strong}"
  stat-tile:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.mono-lg}"
    rounded: "{rounded.lg}"
    padding: 16px
    border: "1px {colors.hairline}"

  # --- Status badges (koli state) ---
  badge-open:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.status-open}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  badge-closed:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.status-closed}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  badge-shipped:
    backgroundColor: "{colors.info-tint}"
    textColor: "{colors.status-shipped}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  badge-count:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  barcode-chip:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: 4px 8px

  # --- Inputs ---
  text-input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 14px 14px
    minHeight: 50px
    border: "1px {colors.hairline-strong}"
  text-input-focused:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    border: "2px {colors.primary-ring}"
  text-input-error:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    border: "2px {colors.error}"
  search-bar:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 10px 16px
    minHeight: 44px
  segmented-control:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 4px
  segmented-active:
    backgroundColor: "{colors.surface-4}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"

  # --- Scan feedback overlays (full-bleed; paired with sound + icon) ---
  scan-overlay-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
  scan-overlay-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
  scan-frame:
    backgroundColor: "transparent"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    border: "3px {colors.primary-ring}"

  # --- Toasts ---
  toast-success:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 14px
    leftAccent: "4px {colors.success}"
  toast-error:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 14px
    leftAccent: "4px {colors.error}"
  toast-info:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 14px
    leftAccent: "4px {colors.info}"

  # --- Modals & sheets (ResultModal / PrintBarcodeModal / ReceiptConfirmModal) ---
  modal-sheet:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xxl}"
    padding: 24px
    border: "1px {colors.hairline}"
  modal-result-success:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.xxl}"
    padding: 24px
    topAccent: "4px {colors.success}"
  modal-result-error:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.xxl}"
    padding: 24px
    topAccent: "4px {colors.error}"

  # --- Login (Space Grotesk + chevron motif moment) ---
  login-hero:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
---

## Overview

Extreme's app surface is a **neutral near-black canvas** — `{colors.canvas}` (#0C0B0D), a whisper warmer than pure black so it sits comfortably under the brand's scarlet. On top is a four-step surface ladder (`{colors.surface-1}` → `{colors.surface-4}`) for rows, cards, sheets, and lifted controls, separated by hairline borders (`{colors.hairline}` → `{colors.hairline-strong}`) rather than shadow. Light type (`{colors.ink}` #F6F6F7) carries headlines and body.

The single brand voltage is **Extreme Red** `{colors.primary}` (#DA2128) — the scarlet of the logo's `X` chevron. It appears scarcely and with intent: the primary CTA, the active tab, the scan trigger, selected rows, and the chevron motif. The system borrows **Ferrari's** dark-canvas + scarce-red architecture, **IBM Carbon's** complete semantic palette and Plex/Mono discipline for codes, **Linear's** shadowless surface ladder, **Revolut's** mobile pill-and-card touch ergonomics, and **Binance's** green/red data-signal language.

This is not a marketing canvas — it is a **warehouse terminal tool**. Every decision serves an operator scanning fast, in variable light, building boxes ("koli") and waybills ("irsaliye"). Legibility, large targets, and unmistakable scan feedback outrank decoration.

**Key Characteristics:**
- **Dark operational system** — `{colors.canvas}` (#0C0B0D) neutral near-black, never pure #000.
- **Extreme Red as scarce voltage** — brand mark, primary CTA, active tab, scan trigger, selected row, chevron. Never a background wash, never decorative.
- **Four-step surface ladder** carries hierarchy without shadow.
- **Complete semantic palette** — success / error / warning / info, each with a tint surface for toasts and row washes.
- **Indigo `{colors.info}`** is the restrained secondary/info accent (links, neutral badges) — honoring a modern-fintech flavor without competing with red.
- **JetBrains Mono / IBM Plex Mono** for every code, barcode, quantity, and ID — tabular figures align in lists.
- **Touch targets ≥48px**; rows ≥64px; the scan trigger is the largest, reddest object on screen.

### The Red / Error Reconciliation (read this first)

The brand is red **and** red is the universal alert color. They do not fight, because they are separated by **scale and motion, not hue**:

- **Action-red** (`{colors.primary}` #DA2128, a deep crimson) is always *contained* — a button fill, a 3px accent stripe, a thin focus ring, a chevron. It never flashes, never fills the screen.
- **Alert-red** (`{colors.error}` #FF3340, a hotter, brighter red) is always *expansive and momentary* — a full-bleed scan-fail overlay or a top-accented result modal, **always paired with the error sound (`error_1.mp3`) and a large icon**.
- An operator never confuses a small dark-crimson button with a full-screen hot-red flash that beeps.

**Success is the one protected signal:** scan-OK, box-closed, and confirmations are **always green `{colors.success}` and never red.** Green is the loudest, most saturated semantic in the system precisely so it can never be mistaken for the brand.

## Colors

### Brand & Accent
- **Extreme Red** ({colors.primary}): The signature scarlet — primary CTA, active tab, scan trigger, selected-row accent, chevron motif. The lone brand voltage.
- **Red Bright** ({colors.primary-bright}): Lighter scarlet (#F23643) — pressed-highlight, focus ring (`{colors.primary-ring}`), scan-frame stroke.
- **Red Deep / Press** ({colors.primary-deep} / {colors.primary-press}): Darker crimson for pressed button states and the bottom of the chevron gradient.
- **Red Tint** ({colors.primary-tint}): Near-black red-tinted surface (#2A1316) — the fill of a selected/active list row on dark.

### Surface
- **Canvas** ({colors.canvas}): Default screen background — #0C0B0D, neutral near-black, faintly warm.
- **Surface 1** ({colors.surface-1}): One step above — list rows, cards, tab bar, modal sheets.
- **Surface 2** ({colors.surface-2}): Two steps above — inputs, pressed rows, secondary buttons, segmented control track.
- **Surface 3** ({colors.surface-3}): Three steps above — toasts, barcode chips, lifted controls.
- **Surface 4** ({colors.surface-4}): Four steps above — active segment, deepest lifted control.
- **Hairline / Hairline Strong** ({colors.hairline} / {colors.hairline-strong}): 1px borders and dividers; the strong variant carries input borders.
- **Scrim** ({colors.scrim}): Modal backdrop.

### Inverse (light surfaces)
- **Inverse Canvas / Surface** ({colors.inverse-canvas} / {colors.inverse-surface-1}): White and near-white — **only** for inherently light artifacts: barcode labels, print previews, and printed receipts, where a dark theme would waste toner and reduce scan reliability.
- **Inverse Ink** ({colors.inverse-ink}): #161518 type on those light surfaces.

### Text
- **Ink** ({colors.ink}): Headlines and primary body — #F6F6F7.
- **Ink Muted** ({colors.ink-muted}): Secondary type — #A6A4AB.
- **Ink Subtle** ({colors.ink-subtle}): Tertiary / meta — #76747C.
- **Ink Tertiary / Disabled** ({colors.ink-tertiary} / {colors.ink-disabled}): Quaternary and disabled labels.

### Semantic (each ships a tint surface for toasts / row washes)
- **Success** ({colors.success}): Scan-OK, box closed, confirmations — #23C277. The protected signal.
- **Error** ({colors.error}): Scan-fail, validation, destructive confirm — #FF3340. Hotter than brand crimson; always with icon + sound.
- **Warning** ({colors.warning}): Box open / in-progress, non-blocking cautions — #F5A524.
- **Info** ({colors.info}): Indigo #5B5BF0 — links, neutral info, "shipped" status. The restrained secondary accent.

### Data & Status
- **Stock In / Out** ({colors.stock-in} / {colors.stock-out}): Quantity deltas — green up, red down (Binance language).
- **Status: Open / Closed / Shipped / Empty** ({colors.status-open} / {colors.status-closed} / {colors.status-shipped} / {colors.status-empty}): The koli lifecycle, mapped to amber → green → indigo → subtle.

## Typography

### Font Family
- **Inter** — All UI text: screen titles, card titles, body, buttons, captions. Enable `tabular-nums` wherever numbers appear in rows. Free (Google Fonts), excellent at small sizes, ships well via `expo-font`.
- **Space Grotesk** — Display moments only: login hero, empty-state headlines, large dashboard figures. Its geometric, slightly mechanical cut echoes the rounded geometry of the Extreme logo letterforms. Used sparingly.
- **JetBrains Mono** (fallback **IBM Plex Mono**) — Every barcode, package number, current-account code, receipt number, and quantity. Tabular figures keep columns aligned in dense lists; the mono face also signals "machine data" vs. human labels.

### Hierarchy

| Token | Size | Weight | Family | Use |
|---|---|---|---|---|
| `{typography.display-xl}` | 34px | 700 | Space Grotesk | Login hero, onboarding |
| `{typography.display-lg}` | 28px | 700 | Space Grotesk | Scan-overlay verdict, empty states |
| `{typography.headline}` | 22px | 600 | Space Grotesk | Modal titles, section heroes |
| `{typography.screen-title}` | 20px | 600 | Inter | Top-app-bar title |
| `{typography.card-title}` | 17px | 600 | Inter | Koli/inventory row title |
| `{typography.body-lg}` | 16px | 400 | Inter | Primary body, form values |
| `{typography.body}` | 15px | 400 | Inter | Default body, list secondary line |
| `{typography.body-sm}` | 13px | 400 | Inter | Meta, toast text |
| `{typography.caption}` | 11px | 500 | Inter | Tab labels, badges, timestamps |
| `{typography.label}` | 12px | 600 | Inter | Field labels / eyebrows (tracked +0.6px, uppercase) |
| `{typography.button}` | 15px | 600 | Inter | All button labels |
| `{typography.mono-lg}` | 22px | 500 | JetBrains Mono | The big scanned-code readout, stat tiles |
| `{typography.mono}` | 14px | 500 | JetBrains Mono | Barcodes, codes, quantities in rows |
| `{typography.mono-sm}` | 12px | 500 | JetBrains Mono | Dense secondary codes |

### Principles
- **Inter is the voice; Space Grotesk is the accent.** Reach for Grotesk only at display sizes and login.
- **Numbers are mono.** Any value an operator reads, verifies, or types against a physical label is JetBrains Mono with tabular figures.
- **Labels track positive (+0.6px), display tracks negative.** The contrast marks labels as taxonomy.
- Never go below 11px. Field operators read at arm's length, sometimes moving.

## Layout

### Spacing System
- **Base unit**: 4px. Tokens: `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 16 · `{spacing.lg}` 20 · `{spacing.xl}` 24 · `{spacing.xxl}` 32 · `{spacing.xxxl}` 48.
- **Screen gutter**: `{spacing.gutter}` 16px left/right on every screen.
- Row interior padding: 14px vertical · 16px horizontal. Card padding: 16px. Modal padding: 24px.
- Gap between list rows: 8px (`{spacing.xs}`). Gap between sections: 24px (`{spacing.xl}`).

### Grid & Container
- Single-column, full-width rows — phones and rugged handhelds (Zebra / Honeywell, 4.0–6.5") are portrait-first.
- Dashboard stat tiles: 2-up grid with 12px gutter.
- Lists are virtualized (`FlatList`); rows are fixed-height (≥64px) for smooth scroll on low-end terminal CPUs.

### Whitespace Philosophy
The dark canvas IS the whitespace. Rows and cards separate by surface lift + hairline, not by large gaps. Keep density high — operators want more rows per screen — but never below the 48px touch floor.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No border, on `{colors.canvas}` | Screen background, body type |
| 1 (lift) | `{colors.surface-1}` + 1px `{colors.hairline}` | Rows, cards, tab bar, sheets |
| 2 (input) | `{colors.surface-2}` + 1px `{colors.hairline-strong}` | Inputs, secondary buttons, pressed rows |
| 3 (control) | `{colors.surface-3}` | Toasts, chips, lifted controls |
| 4 (focus) | 2px `{colors.primary-ring}` outline | Focused input, scan frame |
| FAB | `{colors.primary}` + colored shadow `0 6px 20px rgba(218,33,40,0.35)` | The scan trigger — the only element that casts a (red) shadow |

Depth is carried by the surface ladder. The **only** shadow in the system is the red glow under the scan FAB — it earns its prominence as the protagonist action.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 6px | Barcode chips, small tags |
| `{rounded.sm}` | 8px | Segmented-control thumb, inline chips |
| `{rounded.md}` | 10px | Buttons, inputs |
| `{rounded.lg}` | 14px | Rows, cards, stat tiles, scan frame |
| `{rounded.xl}` | 18px | Large cards |
| `{rounded.xxl}` | 24px | Bottom-sheet / modal top corners |
| `{rounded.pill}` | 9999px | Scan FAB, search bar, badges, status pills, count bubbles |

### The Chevron Motif
The logo's `X` is a forward double-chevron in a red gradient (`#E11D2B` → `#8E1016`). Reuse it as a **brand watermark** behind the login hero and empty states, and as the **scan-success direction cue**. Never as a functional arrow/affordance (avoid confusion with navigation chevrons — those stay `{colors.ink-subtle}` and thin).

## Components

### Navigation
- **`top-app-bar`** — 56px, `{colors.canvas}`, screen title in `{typography.screen-title}`, back chevron left, contextual action right.
- **`bottom-tab-bar`** — 64px, `{colors.surface-1}`, 1px top hairline. Tabs: Dashboard · Cari · Stok · Koli. Active tab uses `bottom-tab-active` — icon + label flip to `{colors.primary}`; inactive stay `{colors.ink-subtle}`.

### Buttons
- **`button-primary`** — Extreme Red fill, white label, `{rounded.md}`, ≥48px. The single primary action per screen (Giriş, Kaydet, Oluştur).
- **`button-secondary`** — `{colors.surface-2}` fill, 1px `{colors.hairline-strong}`, ink label. Secondary actions.
- **`button-ghost`** — Transparent, muted label. Tertiary / cancel.
- **`button-danger`** — `{colors.error}` fill. Destructive only (Koliden sil, Kutuyu boşalt) — and always behind a confirm.

### Scan Trigger
- **`scan-fab`** — 64px red pill with red glow; floats bottom-center above the tab bar on list screens. The biggest, reddest object on screen.
- **`scan-bar`** — Full-width 56px red bar variant for the scanner-entry screens (`create-koli`, `koli-detay`).

### Lists & Cards
- **`list-row`** — `{colors.surface-1}`, `{rounded.lg}`, ≥64px. Title in `{typography.card-title}`, secondary line in `{typography.body-sm}` muted, codes/quantities in `{typography.mono}`. Trailing status badge + thin nav chevron.
- **`list-row-selected`** — Multi-select (long-press) state: `{colors.primary-tint}` fill + 3px `{colors.primary}` left accent + a `badge-count` showing the selection tally. (Drives bulk-waybill creation in `koli-listesi`.)
- **`card` / `card-elevated`** — Detail containers (`koli-detay` header, account detail).
- **`stat-tile`** — Dashboard metric: big `{typography.mono-lg}` number over a `{typography.label}` caption.

### Status & Codes
- **`badge-open` / `badge-closed` / `badge-shipped`** — Koli lifecycle pills (amber / green / indigo on their tint surfaces).
- **`badge-count`** — Red count bubble (selection tally, item count).
- **`barcode-chip`** — Mono code on `{colors.surface-3}`, `{rounded.sm}`. Tappable to re-scan/copy.

### Inputs
- **`text-input`** — `{colors.surface-2}`, 1px `{colors.hairline-strong}`, ≥50px. Focus → 2px `{colors.primary-ring}`. Error → 2px `{colors.error}` + `{typography.body-sm}` error line.
- **`search-bar`** — Pill, `{colors.surface-2}`, leading search glyph. Drives `koliListesi` search.
- **`segmented-control`** — Scanner-mode switch (Oluştur / Ekle / Sil / Ara). Track `{colors.surface-2}`; active thumb `segmented-active` `{colors.surface-4}`.

### Scan Feedback (the heart of the app)
- **`scan-frame`** — Live camera reticle: transparent center, 3px `{colors.primary-ring}` corners.
- **`scan-overlay-success`** — On valid scan: full-bleed `{colors.success}` flash (~350ms) + check icon + `{typography.display-lg}` count/verdict. No sound (success is quiet).
- **`scan-overlay-error`** — On invalid/duplicate/not-found: full-bleed `{colors.error}` flash + X icon + reason text, **with `error_1.mp3`**. This is where alert-red lives — expansive, momentary, audible.

### Toasts & Modals
- **`toast-success` / `toast-error` / `toast-info`** — `{colors.surface-3}` with a 4px semantic left accent (`react-native-toast-message`).
- **`modal-sheet`** — Bottom sheet, `{rounded.xxl}` top, `{colors.surface-1}` (PrintBarcodeModal, ReceiptConfirmModal).
- **`modal-result-success` / `modal-result-error`** — ResultModal with a 4px top semantic accent + large icon; the error variant beeps.

## Do's and Don'ts

### Do
- Keep `{colors.primary}` red **scarce and contained** — one primary action per screen, plus active tab + scan trigger.
- Make **success green loud** and reserve it strictly for confirmations / scan-OK.
- Pair every **error-red** moment with an **icon + the error sound** — never silent red.
- Use **mono with tabular figures** for every barcode, code, and quantity.
- Hold **≥48px** touch targets; **≥64px** rows.
- Lift hierarchy with the **surface ladder**, not shadows (the scan FAB is the one exception).
- Use **indigo `{colors.info}`** for links and neutral info only — keep it quiet.

### Don't
- Don't wash a background or card in brand red — red is voltage, not surface.
- Don't let success ever be red, or let a brand-red button flash like an alert.
- Don't use pure `#000000` as canvas — the warm near-black is intentional under red.
- Don't render codes/quantities in the proportional UI font.
- Don't add a second chromatic accent beyond the indigo secondary.
- Don't drop shadows on cards/rows; don't round rows past `{rounded.lg}`.
- Don't ship a light app shell — light surfaces are only for printed labels/receipts.

## Responsive Behavior

### Device Targets

| Class | Width | Notes |
|---|---|---|
| Rugged handheld | 480px (4.0–5.0") | Zebra TC2x/Honeywell — physical scan key; keep one-hand reach, FAB bottom-center |
| Phone | 360–430px | Standard Android/iOS |
| Phablet / tablet | 600px+ | Lists cap at ~640px content width, centered; stat grid 3-up |

### Touch & Hardware
- All interactive elements ≥48px; primary actions ≥56px.
- Respect the **hardware scan key**: where present, the on-screen `scan-fab` mirrors it, never replaces it.
- Numeric entry (gross/net weight, quantity) uses a large mono keypad-friendly field.

### Collapsing Strategy
- Top-bar contextual actions overflow into a kebab menu below 360px.
- Dashboard stat grid: 2-up default → 3-up at 600px+.
- Long titles truncate to one line with tail ellipsis; the mono code never truncates (it wraps or shrinks one step).

## Iteration Guide
1. Work one component at a time; reference it by its `components:` token name.
2. Decide the surface level (0–4) before color.
3. Default body to `{typography.body}` (Inter 400); default numbers to `{typography.mono}`.
4. Treat red as scarce: brand mark, primary CTA, active tab, scan trigger, selected row, chevron.
5. For any new feedback state, ask: is it the protected success (green), or an alert (red + icon + sound)?
6. Run `npx @google/design.md lint DESIGN-extreme.md` after edits.

## Known Gaps
- Light/printed-label tokens (`inverse-*`) cover barcode labels and receipts only; a full light *app* theme is intentionally out of scope.
- Motion specs (overlay flash duration, row press) are described qualitatively (~350ms) — tune against real device frame rates.
- The Space Grotesk ↔ logo-letterform match is an approximation; if Extreme has a licensed brand face, swap it into the display tokens and keep Inter for body.
- Exact logo-red gradient stops (`#E11D2B` → `#8E1016`) are estimated from the supplied logo; replace with the official brand hex if a guideline exists.
- Haptics are assumed to accompany scan feedback (success = light, error = heavy) but are a platform concern, not a visual token.
