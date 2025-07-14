import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.budgetbros.app',
    appName: 'BudgetBros',
    webDir: 'dist/budget-bros/browser',
    server: {
        url: 'http://192.168.1.64:4200',
        cleartext: true
    }
};

export default config;
