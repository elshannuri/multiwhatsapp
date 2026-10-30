# Multi WhatsApp

Multi-profile WhatsApp Web desktop client built with **Electron**. It opens the official WhatsApp Web interface inside the app — each profile runs in its own isolated session.

**Dillər / Languages:** [English](#english) · [Azərbaycanca](#azərbaycanca)

---

## English

### Features

- 🗂️ **Multiple profiles** — each with its own isolated WhatsApp session (`persist:wa-<id>` partition).
- ➕ Add, ✏️ rename, ↻ refresh, ⏻ logout and ✕ delete profiles.
- 🖱️ **Drag-and-drop** profile reordering (order is saved).
- 📏 **Resizable panels** — the Messages list and the Calls / Status / Channels / Communities lists can all be widened/narrowed by dragging their right edge.
- ⌨️ **F5** (or the ↻ button) reloads the active WhatsApp without touching the session.
- 🌐 **Bilingual UI** — English and Azerbaijani, switched instantly from the `EN`/`AZ` button in the sidebar; the choice is remembered.
- 🪟 Custom modal dialogs (Electron does not support `prompt()`/`confirm()`).

### Requirements

- [Node.js](https://nodejs.org/) (tested with v24)
- Windows 10/11

### Install & Run

```bash
npm install
# Electron binaryini əl ilə quraşdırmaq lazım olsa:
# node node_modules/electron/install.js
npm start
```

### Build (Windows EXE)

```bash
npm run dist
```

Output is written to `dist/`:

| File | Description |
|------|-------------|
| `MultiWhatsApp.exe` | Portable — single file, no install needed |
| `MultiWhatsApp-Setup-<version>.exe` | Installer (desktop & Start Menu shortcuts) |

> Note: the built EXEs are unsigned, so Windows SmartScreen may warn on first launch — choose **Run anyway**.

### Project structure

```
main.js          — Electron main: window, IPC (profiles + settings), UA/permission/download handling
preload.js       — contextBridge → window.api
public/
  index.html     — UI shell
  app.js         — profile list, webview management, custom modal, drag-and-drop, i18n
  style.css      — styles
  translations.js— EN / AZ dictionaries
```

### How sessions work

Each profile gets its own `<webview>` with a separate `partition` (`persist:wa-<id>`), so every profile stays logged in independently. Sessions live in Electron's `userData` directory; `data/profiles.json` only holds the profile list (names and order).

### Author

**Elşən Nuri** — elshann999@gmail.com

---

## Azərbaycanca

### Xüsusiyyətlər

- 🗂️ **Çoxlu profil** — hər biri ayrı, izolyasiya olunmuş WhatsApp sessiyası ilə (`persist:wa-<id>` partition).
- ➕ Əlavə et, ✏️ adını dəyiş, ↻ yenilə, ⏻ çıxış et və ✕ sil.
- 🖱️ **Sürüşdür-burax** ilə profillərin sırasını dəyiş (sıra yadda qalır).
- 📏 **Genişləndirilə bilən panellər** — Mesajlar siyahısı ilə yanaşı Zənglər / Durum / Kanallar / Topluluklar siyahıları da sağ kənarından dartılaraq genişlədilib-kiçildilə bilir.
- ⌨️ **F5** (və ya ↻ düyməsi) aktiv WhatsApp-ı sessiyaya toxunmadan yeniləyir.
- 🌐 **İkidilli interfeys** — İngilis və Azərbaycan dili; yandakı `EN`/`AZ` düyməsi ilə dərhal dəyişdirilir, seçim yadda saxlanılır.
- 🪟 Xüsusi modal pəncərələr (Electron `prompt()`/`confirm()` dəstəkləmir).

### Tələblər

- [Node.js](https://nodejs.org/) (v24 ilə yoxlanılıb)
- Windows 10/11

### Quraşdırma və işə salma

```bash
npm install
# Electron binary əl ilə qurulmalı olsa:
# node node_modules/electron/install.js
npm start
```

### Build (Windows EXE)

```bash
npm run dist
```

Nəticə `dist/` qovluğuna yazılır:

| Fayl | Təsvir |
|------|--------|
| `MultiWhatsApp.exe` | Portable — tək fayl, quraşdırma tələb etmir |
| `MultiWhatsApp-Setup-<version>.exe` | Quraşdırıcı (masaüstü & Başlat menyusu qısayolları) |

> Qeyd: hazır EXE-lər imzasızdır, ona görə Windows ilk açılışda SmartScreen xəbərdarlığı göstərə bilər — **"Yenə də işə sal"** seçin.

### Layihə strukturu

```
main.js          — Electron main: pəncərə, IPC (profillər + parametrlər), UA/icazə/endirmə
preload.js       — contextBridge → window.api
public/
  index.html     — UI skeleti
  app.js         — profil siyahısı, webview idarəsi, custom modal, drag-and-drop, i18n
  style.css      — stillər
  translations.js— AZ / EN lüğət
```

### Sessiyalar necə işləyir

Hər profil ayrı `<webview>` və ayrı `partition` (`persist:wa-<id>`) alır, beləcə hər profil müstəqil girişli qalır. Sessiyalar Electron-un `userData` qovluğunda saxlanılır; `data/profiles.json` yalnız profil siyahısını (adlar və sıra) tutur.

### Müəllif

**Elşən Nuri** — elshann999@gmail.com
