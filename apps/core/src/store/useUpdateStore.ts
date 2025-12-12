import { create } from 'zustand';
import { CURRENT_VERSION } from '../version';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import type { BundleInfo } from '@capgo/capacitor-updater';

interface UpdateState {
  hasUpdate: boolean;
  updateAvailable: boolean; // True if update is downloaded and ready to verify/set
  showSuccess: boolean; // True if we just updated
  latestVersion: string | null;
  changelog: string | null;
  downloadProgress: number | null;
  isChecking: boolean;
  isDownloading: boolean;
  lastCheckTime: number | null; // #10: Rate limiting
  downloadedBundle: BundleInfo | null; // #1: Store bundle info for correct set()
  
  initialize: () => void;
  checkForUpdate: () => Promise<void>;
  downloadAndInstall: () => Promise<void>;
  dismissSuccess: () => void;
  resetUpdate: () => void;
}

const isNewer = (v1: string, v2: string): boolean => {
  const p1 = v1.split('.').map(Number);
  const p2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return true;
    if (n1 < n2) return false;
  }
  return false;
};

// #10: Rate limit - check at most once per hour
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in ms

// #9: Fallback URLs in case primary fails
const UPDATE_URLS = [
  'https://mindspace-app-pi.vercel.app/version.json',
  'https://raw.githubusercontent.com/Psyodrz/MindSpace/main/apps/landing/public/version.json'
];

// Helper to try multiple URLs
async function fetchWithFallback(urls: string[]): Promise<Response> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return response;
    } catch (e) {
      console.warn(`Failed to fetch ${url}:`, e);
    }
  }
  throw new Error('All update URLs failed');
}

export const useUpdateStore = create<UpdateState>((set, get) => ({
  hasUpdate: false,
  updateAvailable: false,
  showSuccess: false,
  latestVersion: null,
  changelog: null,
  downloadProgress: null,
  isChecking: false,
  isDownloading: false,
  lastCheckTime: null,
  downloadedBundle: null,

  initialize: () => {
    // 1. Notify native side
    CapacitorUpdater.notifyAppReady();
    
    // 2. Check if we just updated (#4 fix: only show if upgrading, not fresh install)
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion && isNewer(CURRENT_VERSION, savedVersion)) {
      set({ showSuccess: true });
    }
    // Update local storage to current
    localStorage.setItem('app_version', CURRENT_VERSION);
    
    // 3. Check for updates with a delay to prevent startup freeze
    setTimeout(() => {
        get().checkForUpdate();
    }, 3000);
  },

  checkForUpdate: async () => {
    const { lastCheckTime, isChecking } = get();
    
    // #10: Rate limiting - skip if checked recently
    if (lastCheckTime && Date.now() - lastCheckTime < UPDATE_CHECK_INTERVAL) {
      console.log('Skipping update check - checked recently');
      return;
    }
    
    if (isChecking) return;
    
    // #3: Network connectivity check
    if (!navigator.onLine) {
      console.warn('Skipping update check - offline');
      return;
    }
    
    set({ isChecking: true, lastCheckTime: Date.now() });
    try {
        // #9: Use fallback URLs
        const response = await fetchWithFallback(UPDATE_URLS);
        
        const data = await response.json();
        
        if (data.latestVersion && isNewer(data.latestVersion, CURRENT_VERSION)) {
            set({
                hasUpdate: true,
                latestVersion: data.latestVersion,
                changelog: data.changelog
            });
            
            // Manual update: We wait for user action.
        } else {
            set({ hasUpdate: false });
        }
        
    } catch (e) {
        console.warn('Update check failed:', e);
    } finally {
        set({ isChecking: false });
    }
  },

  downloadAndInstall: async () => {
     const { latestVersion, isDownloading } = get();
     if (!latestVersion || isDownloading) return;

     // #3: Network connectivity check
     if (!navigator.onLine) {
       alert('No internet connection. Please check your network and try again.');
       return;
     }

     set({ isDownloading: true, downloadProgress: 0 });

     try {
       // #9: Use fallback URLs
       const response = await fetchWithFallback(UPDATE_URLS);
       const data = await response.json();
       const baseUrl = response.url;
       
       if (data.zipUrl) {
           // Support both absolute URLs and relative paths
           const zipUrl = data.zipUrl.startsWith('http') 
               ? data.zipUrl 
               : new URL(data.zipUrl, baseUrl).toString();
           
           const bundle = await CapacitorUpdater.download({
               url: zipUrl,
               version: latestVersion,
           });
           
           console.log('Update downloaded:', bundle);
           
           // #1 FIX: Use the bundle.id from download response, not version string
           await CapacitorUpdater.set({ id: bundle.id });
           
           set({ 
             updateAvailable: true, 
             downloadProgress: 100,
             downloadedBundle: bundle 
           });
       }
     } catch (e) {
         console.error('Failed to download update:', e);
         // #2 FIX: Reset state properly to allow retry
         set({ 
           downloadProgress: null,
           updateAvailable: false
         });
         alert('Download failed. Please check your connection and try again.');
     } finally {
         set({ isDownloading: false });
     }
  },

  dismissSuccess: () => set({ showSuccess: false }),

  resetUpdate: () => set({ hasUpdate: false, latestVersion: null, downloadedBundle: null })
}));
