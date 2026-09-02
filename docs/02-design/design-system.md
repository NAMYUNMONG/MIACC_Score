# M32 Pages Design System

## Theme

- Default identity: MIDAS-inspired Dark
- Alternate mode: warm neutral Light
- Storage key: `m32-theme`
- Selection order: saved preference → OS preference → Dark fallback
- Theme hook: `<html data-theme="dark|light">`

## Core Tokens

| Semantic token | Dark | Light |
|----------------|------|-------|
| Background | `#0b0c0e` | `#f4f1e9` |
| Surface | `#121419` | `#ffffff` |
| Muted surface | `#181b21` | `#f8f5ed` |
| Border | `#2b2f38` | `#cec6b7` |
| Text | `#f4f5f7` | `#1b1d21` |
| Muted text | `#a7adb8` | `#5d626b` |
| Gold action | `#d4af37` | `#806512` |
| Gold text/focus | `#f1d47a` | `#654f0b` |

## Components

- Utility Header: sticky, translucent, anchor navigation
- Theme Toggle: native button, 44px minimum target, text/icon state
- Hero: purpose, primary/secondary actions, verified statistics
- Quick Access Card: current Audio Lab, guide, and Scene
- Resource Card: available/latest/scene/reference/restore states
- Filter Button: `aria-pressed` state
- Lab Disclosure: native `details/summary`, collapsed by default
- Lab Tabs: `aria-pressed` state with existing control panels

## Responsive Rules

- Mobile `<768px`: one-column cards and controls, horizontally scrollable navigation
- Tablet `768–1023px`: two-column cards, one-column Lab shell
- Desktop `≥1024px`: three-column Quick Access, two-column library
- Content max width: 1220px
- Touch target: minimum 44px

## Accessibility

- Visible focus outline uses theme-aware gold token
- Theme and filter states expose accessible labels/pressed states
- Reduced motion preference disables transitions and smooth scrolling
- Status is communicated with text as well as color
