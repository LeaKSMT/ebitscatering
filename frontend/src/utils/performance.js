// Performance monitoring utilities
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Error tracking utility
export const trackError = (error, errorInfo = null) => {
  // Send to monitoring service
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        react: errorInfo ? { componentStack: errorInfo.componentStack } : undefined
      }
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Tracked error:', error, errorInfo);
  }
};

// User activity tracking
export const trackUserAction = (action, properties = {}) => {
  const event = {
    action,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...properties
  };

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', action, properties);
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('User action tracked:', event);
  }
};

// Page view tracking
export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Page view tracked:', path);
  }
};
