# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KC Paan is a cross-platform (iOS, Android, Web) e-commerce app for an Indian paan and Ayurvedic products business. Built with React Native + Expo, pure JavaScript (no TypeScript).

## Build & Run Commands

```bash
# Install dependencies (use --legacy-peer-deps for compatibility)
npm install --legacy-peer-deps

# Development
npm start                  # expo start
npm run web                # expo start --web
npm run ios                # expo start --ios
npm run android            # expo start --android
npm run start:clear        # expo start --clear (clears cache)

# Production web build
npx expo export --platform web
```

No test framework or linter is configured.

## Architecture

### Tech Stack
- **Framework**: Expo (~54.0) / React Native 0.81 / React 19
- **Navigation**: React Navigation (stack-based)
- **State**: React Context API (AuthContext, CartContext, AdminAuthContext)
- **HTTP**: Axios with JWT interceptors (auto-refresh on 401)
- **Storage**: AsyncStorage for auth tokens, user data, cart persistence

### Source Structure (src/)

- `api/apiService.js` — Customer-facing API client (40+ methods)
- `api/adminApiService.js` — Admin API client (25+ methods)
- `context/` — AuthContext, CartContext, AdminAuthContext with AsyncStorage persistence
- `navigation/AppNavigator.js` — Stack navigator config (13 customer routes + admin section)
- `screens/` — Customer screens (Home, Products, Cart, Checkout, Events, Contact, Login, etc.)
- `screens/admin/` — Admin dashboard screens (Orders, Products, Categories, Events, Catering)
- `components/` — Reusable UI (Header, SidebarMenu, ProductCard, shared/)
- `utils/constants.js` — API_BASE_URL, endpoint paths, colors, spacing, store info
- `utils/adminConstants.js` — Admin theme colors and nav structure
- `styles/globalStyles.js` — Typography, buttons, spacing styles

### API Integration

API base URL is hardcoded in `src/utils/constants.js` pointing to the Render-hosted backend (`kc-api-iyf2.onrender.com/api`). All API calls go through `apiService.js` or `adminApiService.js` which attach JWT tokens via axios interceptors.

### Key Patterns

- **Cross-platform handling**: `Platform.OS` checks for iOS/Android/Web differences; `Alert.alert` polyfilled with `window.confirm` on web
- **Cart keying**: Items keyed by `{product_id}-{variant_id}` for variants, plain `product_id` otherwise
- **Auth flow**: JWT access + refresh tokens stored in AsyncStorage; auto-refresh on 401 via axios interceptor; separate admin auth context
- **Checkout**: Delivery options (pickup, standard, express), free shipping over $50, conditional address validation

## Design System

- **Primary**: #8B1A1A (burgundy), **Secondary**: #C8860A (gold), **Accent**: #2D5016 (green)
- **Background**: #FDF6ED (warm cream), **Admin background**: #0F1117 (dark)
- **Spacing scale**: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- **Typography**: Serif (Georgia/serif) for headings, system font for body

## AsyncStorage Keys

- `@kcpaan_auth_token`, `@kcpaan_refresh_token`, `@kcpaan_user_data`, `@kcpaan_cart`
