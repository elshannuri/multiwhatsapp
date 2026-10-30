// Multi WhatsApp — tərcümələr (az + en)
// Həm main (Node) həm də renderer (brauzer) tərəfindən istifadə olunur.
const TRANSLATIONS = {
  az: {
    // Ümumi UI
    profiles: 'Profillər',
    newProfile: 'Yeni profil',
    hidePanel: 'Paneli gizlət',
    showPanel: 'Paneli göstər',
    resizeHandle: 'Eni dəyiş',
    emptyState: 'Profil əlavə edin və ya soldan birini seçin',
    cancel: 'Ləğv et',
    ok: 'Tamam',
    language: 'Dil',
    // Profil sırası
    whatsappWeb: 'WhatsApp Web',
    rename: 'Yenidən adlandır',
    refresh: 'Yenilə',
    logout: 'Çıxış',
    remove: 'Sil',
    // Modallar
    newProfileTitle: 'Yeni profil',
    newProfilePlaceholder: 'Profil adı daxil edin...',
    defaultProfileName: 'Yeni profil',
    deleteProfileTitle: 'Profil silinsin?',
    deleteProfileText: 'Bu profilin sessiyası və məlumatları silinəcək.',
    renameProfileTitle: 'Profil adını dəyiş',
    renameProfilePlaceholder: 'Profil adı...',
    // Menyu
    fileMenu: 'Fayl',
    quit: 'Çıxış',
    editMenu: 'Redaktə',
    undo: 'Geri al',
    redo: 'Təkrar et',
    cut: 'Kəs',
    copy: 'Kopyala',
    paste: 'Yapışdır',
    selectAll: 'Hamısını seç',
    helpMenu: 'Kömək',
    about: 'Proqram haqqında',
    aboutTitle: 'Proqram haqqında',
    aboutDetail: 'Müəllif: Elşən Nuri\nEmail: elshann999@gmail.com',
    okButton: 'Tamam',
  },
  en: {
    profiles: 'Profiles',
    newProfile: 'New profile',
    hidePanel: 'Hide panel',
    showPanel: 'Show panel',
    resizeHandle: 'Change width',
    emptyState: 'Add a profile or select one from the left',
    cancel: 'Cancel',
    ok: 'OK',
    language: 'Language',
    whatsappWeb: 'WhatsApp Web',
    rename: 'Rename',
    refresh: 'Refresh',
    logout: 'Log out',
    remove: 'Delete',
    newProfileTitle: 'New profile',
    newProfilePlaceholder: 'Enter profile name...',
    defaultProfileName: 'New profile',
    deleteProfileTitle: 'Delete profile?',
    deleteProfileText: "This profile's session and data will be deleted.",
    renameProfileTitle: 'Rename profile',
    renameProfilePlaceholder: 'Profile name...',
    fileMenu: 'File',
    quit: 'Quit',
    editMenu: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    helpMenu: 'Help',
    about: 'About',
    aboutTitle: 'About',
    aboutDetail: 'Author: Elşən Nuri\nEmail: elshann999@gmail.com',
    okButton: 'OK',
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRANSLATIONS;
}
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
}
