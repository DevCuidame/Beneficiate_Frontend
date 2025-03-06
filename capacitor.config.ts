import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beneficiate.app',
  appName: 'Beneficiate',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['35.232.173.26:3000', 'localhost:3000']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;