export const STORAGE_KEYS = {
  API_KEY: 'atmosphere_api_key',
  OWM_API_KEY: 'atmosphere_owm_api_key',
  UNIT: 'atmosphere_unit',
  THEME: 'atmosphere_theme',
  RECENTS: 'atmosphere_recents',
  BOOKMARKS: 'atmosphere_bookmarks'
};

export const getStoredApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
};

export const setStoredApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.API_KEY, key);
};

export const clearStoredApiKey = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
};

export const getStoredOwmApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.OWM_API_KEY);
};

export const setStoredOwmApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.OWM_API_KEY, key);
};

export const clearStoredOwmApiKey = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.OWM_API_KEY);
};


export const getStoredUnit = (): 'C' | 'F' => {
  if (typeof window === 'undefined') return 'C';
  const unit = localStorage.getItem(STORAGE_KEYS.UNIT);
  return (unit === 'C' || unit === 'F') ? unit : 'C';
};

export const setStoredUnit = (unit: 'C' | 'F'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.UNIT, unit);
};

export const getStoredTheme = (): 'light' | 'dark' | null => {
  if (typeof window === 'undefined') return null;
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  return (theme === 'light' || theme === 'dark') ? theme : null;
};

export const setStoredTheme = (theme: 'light' | 'dark'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getStoredRecents = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const recents = localStorage.getItem(STORAGE_KEYS.RECENTS);
    return recents ? JSON.parse(recents) : [];
  } catch (e) {
    return [];
  }
};

export const addStoredRecent = (city: string): string[] => {
  if (typeof window === 'undefined') return [];
  const recents = getStoredRecents();
  const trimmed = city.trim();
  if (!trimmed) return recents;
  
  // Filter out existing and keep only top 5, adding new one at front
  const updated = [trimmed, ...recents.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
  localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
  return updated;
};

export const removeStoredRecent = (city: string): string[] => {
  if (typeof window === 'undefined') return [];
  const recents = getStoredRecents();
  const updated = recents.filter(item => item.toLowerCase() !== city.trim().toLowerCase());
  localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
  return updated;
};

export const getStoredBookmarks = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const bookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (e) {
    return [];
  }
};

export const toggleStoredBookmark = (city: string): { updated: string[], isBookmarked: boolean } => {
  if (typeof window === 'undefined') return { updated: [], isBookmarked: false };
  const bookmarks = getStoredBookmarks();
  const trimmed = city.trim();
  const index = bookmarks.findIndex(item => item.toLowerCase() === trimmed.toLowerCase());
  let updated: string[];
  let isBookmarked: boolean;

  if (index >= 0) {
    updated = bookmarks.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    isBookmarked = false;
  } else {
    updated = [...bookmarks, trimmed];
    isBookmarked = true;
  }
  
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  return { updated, isBookmarked };
};
