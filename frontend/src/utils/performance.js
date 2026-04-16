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


export const trackError = (error, errorInfo = null) => {

  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        react: errorInfo ? { componentStack: errorInfo.componentStack } : undefined
      }
    });
  }


  if (process.env.NODE_ENV === 'development') {
    console.error('Tracked error:', error, errorInfo);
  }
};


export const trackUserAction = (action, properties = {}) => {
  const event = {
    action,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...properties
  };


  if (window.gtag) {
    window.gtag('event', action, properties);
  }


  if (process.env.NODE_ENV === 'development') {
    console.log('User action tracked:', event);
  }
};


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
