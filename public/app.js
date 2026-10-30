const profileListEl = document.getElementById('profileList');
const addProfileBtn = document.getElementById('addProfileBtn');
const langToggleBtn = document.getElementById('langToggleBtn');
const toggleProfilesBtn = document.getElementById('toggleProfilesBtn');
const sidebarEl = document.getElementById('sidebar');
const resizeHandle = document.getElementById('resizeHandle');
const webviewContainer = document.getElementById('webviewContainer');
const emptyState = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalInput = document.getElementById('modalInput');
const modalCancel = document.getElementById('modalCancel');
const modalOk = document.getElementById('modalOk');

let profiles = [];
let currentProfileId = null;
let dragId = null;
let currentLang = 'en';

function t(key) {
  const TR = window.TRANSLATIONS || {};
  const dict = TR[currentLang] || TR.az || {};
  return dict[key] != null ? dict[key] : key;
}

function updateLangButton() {
  langToggleBtn.textContent = currentLang.toUpperCase();
}

function applyLanguage(lang) {
  currentLang = (lang === 'en') ? 'en' : 'az';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  const collapsed = sidebarEl.classList.contains('collapsed');
  toggleProfilesBtn.title = t(collapsed ? 'showPanel' : 'hidePanel');
  updateLangButton();
  renderProfiles();
}

function partitionFor(id) {
  return 'persist:wa-' + id;
}

async function loadProfiles() {
  profiles = await window.api.listProfiles();
  profiles.forEach((p) => ensureWebview(p));
  renderProfiles();

  if (profiles.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  if (currentProfileId && profiles.some((p) => p.id === currentProfileId)) {
    selectProfile(currentProfileId, false);
  } else if (profiles.length === 1) {
    selectProfile(profiles[0].id, false);
  }
}

function renderProfiles() {
  profileListEl.innerHTML = '';
  profiles.forEach((p) => {
    const li = document.createElement('li');
    li.className = p.id === currentProfileId ? 'active' : '';
    li.innerHTML = `
      <div class="profileInfo">
        <div class="profileName">${esc(p.name)}</div>
        <div class="profileSub">${t('whatsappWeb')}</div>
      </div>
      <div class="profileActions">
        <button data-action="rename" title="${t('rename')}">✎</button>
        <button data-action="refresh" title="${t('refresh')}">↻</button>
        <button data-action="logout" title="${t('logout')}">⏻</button>
        <button data-action="remove" title="${t('remove')}">✕</button>
      </div>
    `;
    li.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]')) return;
      selectProfile(p.id);
    });
    li.querySelector('[data-action="rename"]').addEventListener('click', (e) => {
      e.stopPropagation();
      renameProfile(p.id);
    });
    li.querySelector('[data-action="refresh"]').addEventListener('click', (e) => {
      e.stopPropagation();
      refreshProfile(p.id);
    });
    li.querySelector('[data-action="logout"]').addEventListener('click', (e) => {
      e.stopPropagation();
      logoutProfile(p.id);
    });
    li.querySelector('[data-action="remove"]').addEventListener('click', (e) => {
      e.stopPropagation();
      removeProfile(p.id);
    });

    // Drag & Drop — profillərin sırasını dəyiş
    li.draggable = true;
    li.addEventListener('dragstart', (e) => {
      dragId = p.id;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', p.id); } catch (_) {}
    });
    li.addEventListener('dragend', () => {
      dragId = null;
      document.querySelectorAll('#profileList li').forEach((el) =>
        el.classList.remove('dragging', 'drop-before', 'drop-after')
      );
    });
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = li.getBoundingClientRect();
      const before = (e.clientY - rect.top) < (rect.height / 2);
      li.classList.toggle('drop-before', before);
      li.classList.toggle('drop-after', !before);
    });
    li.addEventListener('dragleave', (e) => {
      if (e.relatedTarget && li.contains(e.relatedTarget)) return;
      li.classList.remove('drop-before', 'drop-after');
    });
    li.addEventListener('drop', async (e) => {
      e.preventDefault();
      li.classList.remove('drop-before', 'drop-after');
      const fromId = dragId;
      if (!fromId || fromId === p.id) return;
      const rect = li.getBoundingClientRect();
      const before = (e.clientY - rect.top) < (rect.height / 2);
      const rest = profiles.filter((x) => x.id !== fromId);
      const idx = rest.indexOf(p);
      const insertAt = before ? idx : idx + 1;
      const dragged = profiles.find((x) => x.id === fromId);
      if (!dragged) return;
      rest.splice(insertAt, 0, dragged);
      await window.api.reorderProfiles(rest.map((x) => x.id));
      await loadProfiles();
    });

    profileListEl.appendChild(li);
  });
}

function ensureWebview(p) {
  let wv = webviewContainer.querySelector(`webview[data-id="${p.id}"]`);
  if (!wv) {
    wv = document.createElement('webview');
    wv.setAttribute('data-id', p.id);
    wv.setAttribute('partition', partitionFor(p.id));
    wv.setAttribute('src', 'https://web.whatsapp.com');
    wv.setAttribute('allowpopups', 'true');
    webviewContainer.appendChild(wv);
  }
  return wv;
}

function selectProfile(id, render = true) {
  currentProfileId = id;
  emptyState.classList.add('hidden');
  profiles.forEach((p) => {
    const wv = ensureWebview(p);
    wv.classList.toggle('active', p.id === id);
  });
  if (render) renderProfiles();
}

async function addProfile() {
  const name = await showModal({ title: t('newProfileTitle'), input: true, placeholder: t('newProfilePlaceholder') });
  if (name === null) return;
  const res = await window.api.addProfile(name || t('defaultProfileName'));
  await loadProfiles();
  selectProfile(res.id);
}

async function removeProfile(id) {
  const ok = await showModal({ title: t('deleteProfileTitle'), text: t('deleteProfileText') });
  if (!ok) return;
  const wv = webviewContainer.querySelector(`webview[data-id="${id}"]`);
  if (wv) wv.remove();
  await window.api.removeProfile(id);
  if (currentProfileId === id) currentProfileId = null;
  await loadProfiles();
}

async function logoutProfile(id) {
  await window.api.logoutProfile(id);
  const wv = webviewContainer.querySelector(`webview[data-id="${id}"]`);
  if (wv) {
    wv.loadURL('https://web.whatsapp.com').catch(() => {});
  }
}

function refreshProfile(id) {
  const wv = webviewContainer.querySelector(`webview[data-id="${id}"]`);
  if (wv) {
    wv.reload();
  }
}

async function renameProfile(id) {
  const p = profiles.find((x) => x.id === id);
  const name = await showModal({ title: t('renameProfileTitle'), input: true, placeholder: t('renameProfilePlaceholder'), value: p ? p.name : '' });
  if (name === null || !name.trim()) return;
  await window.api.renameProfile(id, name.trim());
  await loadProfiles();
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ---------- Modal (prompt/confirm əvəzinə) ----------
let modalResolve = null;

function showModal({ title, text = null, input = false, placeholder = '', value = '' }) {
  return new Promise((resolve) => {
    modalResolve = resolve;
    modalTitle.textContent = title;
    if (text) { modalText.textContent = text; modalText.classList.remove('hidden'); }
    else modalText.classList.add('hidden');
    if (input) { modalInput.classList.remove('hidden'); modalInput.value = value; modalInput.placeholder = placeholder; }
    else modalInput.classList.add('hidden');
    modalOverlay.classList.remove('hidden');
    if (input) setTimeout(() => modalInput.focus(), 50);
  });
}

function closeModal(result) {
  modalOverlay.classList.add('hidden');
  if (modalResolve) { modalResolve(result); modalResolve = null; }
}

modalOk.addEventListener('click', () => {
  closeModal(modalInput.classList.contains('hidden') ? true : modalInput.value);
});
modalCancel.addEventListener('click', () => closeModal(null));
modalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') modalOk.click(); });

toggleProfilesBtn.addEventListener('click', () => {
  const collapsed = sidebarEl.classList.toggle('collapsed');
  if (collapsed) {
    sidebarEl.style.width = '';             // CSS .collapsed (52px) tətbiq olunsun
  } else {
    sidebarEl.style.width = sidebarWidth + 'px';
  }
  toggleProfilesBtn.textContent = collapsed ? '»' : '«';
  toggleProfilesBtn.title = t(collapsed ? 'showPanel' : 'hidePanel');
});

// Sidebar enini dartaraq dəyişmə
let isResizing = false;
let sidebarWidth = 240;   // collapse-dən sonra bərpa olunacaq en (CSS default)

resizeHandle.addEventListener('mousedown', (e) => {
  isResizing = true;
  resizeHandle.classList.add('dragging');
  sidebarEl.style.transition = 'none';
  document.body.classList.add('resizing');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const w = Math.min(480, Math.max(180, e.clientX));
  sidebarWidth = w;
  sidebarEl.style.width = w + 'px';
  sidebarEl.classList.remove('collapsed');
  toggleProfilesBtn.textContent = '«';
  toggleProfilesBtn.title = t('hidePanel');
});

document.addEventListener('mouseup', () => {
  if (!isResizing) return;
  isResizing = false;
  resizeHandle.classList.remove('dragging');
  sidebarEl.style.transition = '';
  document.body.classList.remove('resizing');
});

addProfileBtn.addEventListener('click', addProfile);

langToggleBtn.addEventListener('click', async () => {
  const newLang = currentLang === 'az' ? 'en' : 'az';
  await window.api.setLang(newLang);
  applyLanguage(newLang);
});

// F5 — aktiv profilin WhatsApp-ını yenilə (fokus sidebar/ümumi pəncərədə olanda)
window.addEventListener('keydown', (e) => {
  if (e.key === 'F5') {
    e.preventDefault();
    if (currentProfileId) refreshProfile(currentProfileId);
  }
});

(async function init() {
  let lang = 'en';
  try {
    const s = await window.api.getSettings();
    if (s && s.lang) lang = s.lang;
  } catch (_) {}
  applyLanguage(lang);
  loadProfiles();
})();
