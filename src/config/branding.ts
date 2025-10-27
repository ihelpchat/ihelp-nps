export interface BrandingConfig {
  company: {
    name: string;
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  layout: {
    showLogo: boolean;
    showCompanyName: boolean;
    showUserAvatar: boolean;
    showNotifications: boolean;
    showSearch: boolean;
  };
  features: {
    enableAnalytics: boolean;
    enableWidgetConfig: boolean;
    enableMultiCompany: boolean;
    enableExport: boolean;
    enableWordCloud: boolean;
  };
  messages: {
    welcome?: string;
    dashboardTitle?: string;
    footer?: string;
  };
}

export const defaultBranding: BrandingConfig = {
  company: {
    name: 'iHelp NPS',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  },
  layout: {
    showLogo: true,
    showCompanyName: true,
    showUserAvatar: true,
    showNotifications: true,
    showSearch: true
  },
  features: {
    enableAnalytics: true,
    enableWidgetConfig: true,
    enableMultiCompany: true,
    enableExport: true,
    enableWordCloud: true
  },
  messages: {
    welcome: 'Bem-vindo ao seu dashboard NPS',
    dashboardTitle: 'Dashboard NPS',
    footer: '© 2024 iHelp NPS. Todos os direitos reservados.'
  }
};

export function loadBrandingConfig(): BrandingConfig {
  try {
    // Try to load from environment variables
    const envConfig = {
      company: {
        name: process.env.VITE_COMPANY_NAME || defaultBranding.company.name,
        logo: process.env.VITE_COMPANY_LOGO,
        favicon: process.env.VITE_COMPANY_FAVICON,
        primaryColor: process.env.VITE_PRIMARY_COLOR || defaultBranding.company.primaryColor,
        secondaryColor: process.env.VITE_SECONDARY_COLOR || defaultBranding.company.secondaryColor
      },
      layout: {
        showLogo: process.env.VITE_SHOW_LOGO !== 'false',
        showCompanyName: process.env.VITE_SHOW_COMPANY_NAME !== 'false',
        showUserAvatar: process.env.VITE_SHOW_USER_AVATAR !== 'false',
        showNotifications: process.env.VITE_SHOW_NOTIFICATIONS !== 'false',
        showSearch: process.env.VITE_SHOW_SEARCH !== 'false'
      },
      features: {
        enableAnalytics: process.env.VITE_ENABLE_ANALYTICS !== 'false',
        enableWidgetConfig: process.env.VITE_ENABLE_WIDGET_CONFIG !== 'false',
        enableMultiCompany: process.env.VITE_ENABLE_MULTI_COMPANY !== 'false',
        enableExport: process.env.VITE_ENABLE_EXPORT !== 'false',
        enableWordCloud: process.env.VITE_ENABLE_WORD_CLOUD !== 'false'
      },
      messages: {
        welcome: process.env.VITE_WELCOME_MESSAGE || defaultBranding.messages.welcome,
        dashboardTitle: process.env.VITE_DASHBOARD_TITLE || defaultBranding.messages.dashboardTitle,
        footer: process.env.VITE_FOOTER_MESSAGE || defaultBranding.messages.footer
      }
    };

    return envConfig;
  } catch (error) {
    console.warn('Failed to load branding config from environment, using defaults:', error);
    return defaultBranding;
  }
}

export function applyBrandingStyles(config: BrandingConfig): void {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--primary-color', config.company.primaryColor);
  root.style.setProperty('--secondary-color', config.company.secondaryColor);
  
  // Update favicon if provided
  if (config.company.favicon) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = config.company.favicon;
    }
  }
  
  // Update page title
  if (config.messages.dashboardTitle) {
    document.title = config.messages.dashboardTitle;
  }
}
