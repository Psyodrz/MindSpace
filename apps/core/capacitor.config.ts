import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindspace.app',
  appName: 'MindSpace',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      resetWhenUpdate: false
    }
  }
};

export default config;
