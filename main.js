const { app, BrowserWindow, session, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(app.getPath('userData'), 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const T = require('./public/translations.js');

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// WhatsApp Web-in daxili siyahı panelini (Söhbətlər, Status, Kanallar, Aramalar, İcmalar)
// dartaraq böyüdüb-kiçiltmək üçün skript
const RESIZE_SCRIPT = `
(function() {
  var MIN_W = 250;
  var isDragging = false;

  // Mesajlar (çat siyahısı) ayrı bir kolonda; Zənglər / Durum / Topluluklar / Kanallar
  // isə drawer-left panelində açılır. Hər ikisinə eyni sürüşdürülən en tətbiq olunur.
  var cachedPane = null;
  var cachedKey = null;
  var handleEl = null;
  var currentPanel = null;

  // Hazırda hansı panel aktivdir: sekmə drawer-ı, yoxsa çat siyahısı
  function paneKey() {
    return document.querySelector('[data-testid$="-tab-drawer"]') ? 'drawer' : 'side';
  }

  function findPane() {
    var key = paneKey();
    if (cachedPane && cachedPane.isConnected && cachedKey === key) return cachedPane;

    cachedKey = key;
    cachedPane = null;

    // 1) Aktiv sekmə drawer-ı (Zənglər / Durum / Topluluklar / Kanallar)
    var drawer = document.querySelector('[data-testid="drawer-left"]');
    if (drawer && drawer.querySelector('[data-testid$="-tab-drawer"]')) {
      cachedPane = drawer;
      return cachedPane;
    }

    // 2) Çat siyahısı (Mesajlar)
    cachedPane =
      document.querySelector('div.two > div:has(> #side)') || // cari UI: #side-i daşıyan flex kolon
      document.querySelector('#side') ||                       // köhnə UI
      document.querySelector('#pane-side') ||                  // daha köhnə UI
      document.querySelector('div[data-testid="chat-list"]');  // son ehtiyat
    return cachedPane;
  }

  function maxWidth() {
    return Math.max(MIN_W, Math.min(700, Math.round(window.innerWidth * 0.7)));
  }

  function readSaved() {
    var n = parseInt(localStorage.getItem('chatListWidth'), 10);
    return (n >= MIN_W) ? n : 0;
  }

  function apply(panel, w) {
    w = Math.max(MIN_W, Math.min(maxWidth(), w));
    var px = w + 'px';

    // Aktiv panel + çat siyahısı sütunu + drawer-left eyni enə gətirilir —
    // beləcə sekmə paneli kiçiləndə arxada qalan Mesajlar siyahısı görünmür.
    // #side elementləri birbaşa ölçülmür: onlar kolon konteynerində olduğundan
    // flex-basis hündürlüyü dəyişdirərdi.
    var els = [];
    [panel,
     document.querySelector('[data-testid="drawer-left"]'),
     document.querySelector('div.two > div:has(> #side)')
    ].forEach(function(el) { if (el && els.indexOf(el) < 0) els.push(el); });

    els.forEach(function(el) {
      el.style.setProperty('width', px, 'important');
      el.style.setProperty('min-width', px, 'important');
      el.style.setProperty('max-width', px, 'important');
      el.style.setProperty('flex-basis', px, 'important');
      el.style.setProperty('flex', '0 0 ' + px, 'important');
    });

    positionHandle(panel);
  }

  // Handle panelin sağ kənarında (viewport-a görə) sabit durur —
  // beləcə drawer daxilindəki overflow/z-index onu örtə bilmir.
  function positionHandle(panel) {
    if (!handleEl || !panel) return;
    var r = panel.getBoundingClientRect();
    handleEl.style.display = 'block';
    handleEl.style.left = Math.round(r.right - 4) + 'px';
    handleEl.style.top = Math.round(r.top) + 'px';
    handleEl.style.height = Math.round(r.height) + 'px';
  }

  function ensureHandle() {
    if (handleEl) return;
    handleEl = document.createElement('div');
    handleEl.className = 'mw-resize-handle';
    handleEl.style.cssText = 'position:fixed;top:0;width:8px;cursor:col-resize;z-index:2147483647;display:none;';
    handleEl.addEventListener('mouseenter', function() { handleEl.style.background = '#00a884'; });
    handleEl.addEventListener('mouseleave', function() { handleEl.style.background = ''; });

    handleEl.addEventListener('mousedown', function(e) {
      e.preventDefault(); e.stopPropagation();
      isDragging = true;
      var startX = e.clientX;
      var startW = currentPanel.getBoundingClientRect().width;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      function move(ev) { apply(currentPanel, startW + (ev.clientX - startX)); }
      function up() {
        isDragging = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        localStorage.setItem('chatListWidth', String(Math.round(currentPanel.getBoundingClientRect().width)));
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    document.body.appendChild(handleEl);
  }

  function init() {
    var panel = findPane();
    if (!panel) {
      if (handleEl) handleEl.style.display = 'none';
      return;
    }

    currentPanel = panel;

    // Şəffaf fon — açıq qəhvəyi BODY fonu görünsün, sərhəd xətti olmasın
    panel.style.backgroundColor = 'transparent';
    var side = document.querySelector('#side');
    if (side) side.style.backgroundColor = 'transparent';

    if (!isDragging) {
      var saved = readSaved();
      if (saved) apply(panel, saved);
    }

    ensureHandle();
    positionHandle(panel);
  }

  init();

  // Tab keçidində React paneli yenidən render edib handle-i silir — dərhal bərpa et.
  var timer = null;
  var observer = new MutationObserver(function() {
    if (timer) return;
    timer = setTimeout(function() {
      timer = null;
      init();
    }, 120);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Gec yüklənən UI üçün təhlükəsizlik şəbəkəsi
  setInterval(init, 2000);

  // Pəncərə ölçüsü dəyişəndə handle-i yenidən yerləşdir
  window.addEventListener('resize', function() {
    if (currentPanel) positionHandle(currentPanel);
  });
})();
`;

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
    }
  } catch (e) {
    /* korrupsiya halında boş başla */
  }
  return [];
}

function saveProfiles(profiles) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (e) {
    /* korrupsiya halında default */
  }
  return { lang: 'en' };
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function buildMenu(lang) {
  const dict = T[lang] || T.az || {};
  const t = (key) => (dict[key] != null ? dict[key] : key);

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: t('fileMenu'),
      submenu: [
        { role: 'quit', label: t('quit') }
      ]
    },
    {
      label: t('editMenu'),
      submenu: [
        { role: 'undo', label: t('undo') },
        { role: 'redo', label: t('redo') },
        { type: 'separator' },
        { role: 'cut', label: t('cut') },
        { role: 'copy', label: t('copy') },
        { role: 'paste', label: t('paste') },
        { role: 'selectAll', label: t('selectAll') }
      ]
    },
    {
      label: t('helpMenu'),
      submenu: [
        {
          label: t('about'),
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: t('aboutTitle'),
              message: 'Multi WhatsApp',
              detail: t('aboutDetail'),
              buttons: [t('okButton')]
            });
          }
        }
      ]
    }
  ]));
}

function partitionFor(id) {
  return 'persist:wa-' + id;
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'Multi WhatsApp',
    icon: path.join(__dirname, 'icon.png'),
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  mainWindow.maximize();

  // Hər <webview> üçün: Chrome UA + icazələr + söhbət siyahısını daralt
  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.setUserAgent(CHROME_UA);
    webContents.session.setPermissionRequestHandler((wc, permission, callback) => {
      callback(true);
    });
    // F5 — webview fokusda olanda da WhatsApp yenilənsin
    webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'F5') {
        event.preventDefault();
        webContents.reload();
      }
    });
    webContents.on('did-finish-load', () => {
      const css = [
        'body { background-image: none !important; background-color: #d2b48c !important; }',
        '[data-testid="conversation-background-default_chat_wallpaper"] { display: none !important; }',
        '[data-testid="drawer-left"], [data-testid="drawer-middle"] { border: none !important; }',
      ].join(' ');
      webContents.insertCSS(css, { cssOrigin: 'user' }).catch(() => {});
      webContents.executeJavaScript(RESIZE_SCRIPT).catch(() => {});
    });
  });
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.multi-whatsapp');
  }

  // Əsas pəncərə icazələri (bildirişlər üçün)
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(true);
  });

  ipcMain.handle('profiles:list', () => loadProfiles());

  ipcMain.handle('settings:get', () => loadSettings());

  ipcMain.handle('settings:set-lang', (e, lang) => {
    const s = loadSettings();
    s.lang = (lang === 'en') ? 'en' : 'az';
    saveSettings(s);
    buildMenu(s.lang);
    return { ok: true };
  });

  ipcMain.handle('profiles:add', (e, name) => {
    const profiles = loadProfiles();
    const id = 'profile_' + Date.now().toString(36);
    profiles.push({ id, name: name || 'Yeni profil', createdAt: Date.now() });
    saveProfiles(profiles);
    return { id };
  });

  ipcMain.handle('profiles:rename', (e, id, name) => {
    const profiles = loadProfiles();
    const p = profiles.find((x) => x.id === id);
    if (!p) return { ok: false };
    const newName = String(name || '').trim();
    if (newName) p.name = newName;
    saveProfiles(profiles);
    return { ok: true };
  });

  ipcMain.handle('profiles:reorder', (e, ids) => {
    if (!Array.isArray(ids)) return { ok: false };
    const profiles = loadProfiles();
    const byId = new Map(profiles.map((p) => [p.id, p]));
    const reordered = [];
    ids.forEach((id) => {
      const p = byId.get(id);
      if (p) reordered.push(p);
    });
    // Təhlükəsizlik: ids-də olmayan profilləri sona əlavə et
    profiles.forEach((p) => {
      if (!reordered.includes(p)) reordered.push(p);
    });
    saveProfiles(reordered);
    return { ok: true };
  });

  ipcMain.handle('profiles:remove', async (e, id) => {
    const profiles = loadProfiles().filter((p) => p.id !== id);
    saveProfiles(profiles);
    try {
      const ses = session.fromPartition(partitionFor(id));
      await ses.clearStorageData();
      await ses.clearCache();
    } catch (err) {
      /* sessiya olmaya bilər */
    }
    return { ok: true };
  });

  ipcMain.handle('profiles:logout', async (e, id) => {
    try {
      const ses = session.fromPartition(partitionFor(id));
      await ses.clearStorageData();
      await ses.clearCache();
    } catch (err) {
      /* sessiya olmaya bilər */
    }
    return { ok: true };
  });

  createWindow();

  // Tətbiq menyusunu saxlanılan dillə qur
  buildMenu(loadSettings().lang);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
