import { create } from 'zustand';
import { CURRENT_VERSION } from '../version';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

interface UpdateState {
  hasUpdate: boolean;
  updateAvailable: boolean; // True if update is downloaded and ready to verify/set
  latestVersion: string | null;
  changelog: string | null;
  downloadProgress: number | null;
  isChecking: boolean;
  
  initialize: () => void;
  checkForUpdate: () => Promise<void>;
  downloadAndInstall: () => Promise<void>;
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
  latestVersion: null,
  changelog: null,
  downloadProgress: null,
  isChecking: false,

  initialize: () => {
    // Notify native side that the app has loaded successfully.
    // This completes the update definition and prevents rollback.
    CapacitorUpdater.notifyAppReady();
    
    // Check for updates on load
    get().checkForUpdate();
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
            
            // Auto-trigger download if configured for silent update
            // We'll call downloadAndInstall immediately since user asked for "automatic"
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
       // We fetch version.json again to get the zip URL, or we could store it.
       // Let's assume zipUrl is constructed or passed.
       // The version.json structure should preferably have the full zip URL.
       const UPDATE_URL = 'https://mindspace-app-pi.vercel.app/version.json';
       const response = await fetch(UPDATE_URL);
       const data = await response.json();
       
       if (data.zipUrl) {
           const zipUrl = new URL(data.zipUrl, UPDATE_URL).toString();
           
           // Download and Set the bundle
           const version = await CapacitorUpdater.download({
               url: zipUrl,
               version: latestVersion,
           });
           
           console.log('Update downloaded:', version);
           
           // Set the update.
           // Since resetWhenUpdate is false, this will apply on next app restart,
           // OR we can force it immediately if we want.
           // User asked for "automatically download and apply".
           // Usually applying immediately might disrupt the user, so "next launch" is true silent.
           // However, let's just set it so it's ready.
           await CapacitorUpdater.set({ id: latestVersion });
           
           set({ updateAvailable: true, downloadProgress: 100 });
       }
     } catch (e) {
         console.error('Failed to download update:', e);
     }
  },

  resetUpdate: () => set({ hasUpdate: false, latestVersion: null })
}));
