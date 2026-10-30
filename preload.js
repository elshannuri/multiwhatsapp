const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listProfiles: () => ipcRenderer.invoke('profiles:list'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setLang: (lang) => ipcRenderer.invoke('settings:set-lang', lang),
  addProfile: (name) => ipcRenderer.invoke('profiles:add', name),
  removeProfile: (id) => ipcRenderer.invoke('profiles:remove', id),
  renameProfile: (id, name) => ipcRenderer.invoke('profiles:rename', id, name),
  reorderProfiles: (ids) => ipcRenderer.invoke('profiles:reorder', ids),
  logoutProfile: (id) => ipcRenderer.invoke('profiles:logout', id),
});
