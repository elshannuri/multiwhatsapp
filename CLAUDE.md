# Multi WhatsApp — Layihə Konteksti

> **Universal beyin:** `D:\brain\` — ilk oxu `D:\brain\BRAIN.md`.
> **Layihə beyni:** `D:\brain\projects\multi-whatsapp\`.

## Identity
Multi WhatsApp — Electron masaüstü app. Rəsmi WhatsApp Web interfeysini proqramın içində açır; hər profil ayrı sessiya ilə.

## Stack
- **Electron 45** (masaüstü app)
- **`<webview>`** — hər profil ayrı `<webview>` + ayrı `partition` (`persist:wa-<id>`)
- Renderer: vanilla JS (`public/`)

## Run
```bash
npm install   # electron binary əl ilə: node node_modules/electron/install.js
npm start     # electron .
```

## Architecture
- `main.js` — Electron main: window, IPC (`profiles:list/add/remove/logout`), UA + icazə + endirmə handler-i.
- `preload.js` — `contextBridge` ilə `window.api`.
- `public/app.js` — profil siyahısı + webview idarəsi + custom modal.
- Sessiyalar Electron `userData`-da (`persist:wa-<id>` partition). `data/profiles.json` yalnız profil siyahısı.

## Gotchas
- Electron-da `prompt()`/`confirm()` **İŞLƏMİR** — custom modal istifadə olunur.
- WhatsApp Web UA tələb edir — `did-attach-webview`-da Chrome UA qoyulur.
- Qeyri-aktiv webview-lar `left:-10000px` ilə off-screen saxlanır (sleep olmasın deyə).
