import { create } from 'zustand';
import { CURRENT_VERSION } from '../version';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

interface UpdateState {
  hasUpdate: boolean;
  updateAvailable: boolean; // True if update is downloaded and ready to verify/set
  showSuccess: boolean; // True if we just updated
  latestVersion: string | null;
  changelog: string | null;
  downloadProgress: number | null;
  isChecking: boolean;
  
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

export const useUpdateStore = create<UpdateState>((set, get) => ({
  hasUpdate: false,
  updateAvailable: false,
  showSuccess: false,
  latestVersion: null,
  changelog: null,
  downloadProgress: null,
  isChecking: false,

  initialize: () => {
    // 1. Notify native side
    CapacitorUpdater.notifyAppReady();
    
    // 2. Check if we just updated
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion && savedVersion !== CURRENT_VERSION) {
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
    set({ isChecking: true });
    
    try {
        const UPDATE_URL = 'https://mindspace-app-pi.vercel.app/version.json';
        const response = await fetch(UPDATE_URL);
        if (!response.ok) throw new Error('Update check failed');
        
        const data = await response.json();
        
        if (data.latestVersion && isNewer(data.latestVersion, CURRENT_VERSION)) {
            set({
                hasUpdate: true,
                latestVersion: data.latestVersion,
                changelog: data.changelog
            });
            
            // Auto-trigger download
            if (data.zipUrl) {
                get().downloadAndInstall();
            }
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
     const { latestVersion } = get();
     if (!latestVersion) return;

     try {
       const UPDATE_URL = 'https://mindspace-app-pi.vercel.app/version.json';
       const response = await fetch(UPDATE_URL);
       const data = await response.json();
       
       if (data.zipUrl) {
           const zipUrl = new URL(data.zipUrl, UPDATE_URL).toString();
           
           const version = await CapacitorUpdater.download({
               url: zipUrl,
               version: latestVersion,
           });
           
           console.log('Update downloaded:', version);
           await CapacitorUpdater.set({ id: latestVersion });
           
           set({ updateAvailable: true, downloadProgress: 100 });
       }
     } catch (e) {
         console.error('Failed to download update:', e);
     }
  },

  dismissSuccess: () => set({ showSuccess: false }),

  resetUpdate: () => set({ hasUpdate: false, latestVersion: null })
}));
