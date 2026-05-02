export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
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
        react: errorInfo ? { componentStack: errorInfo.componentStack } : undefined,
      },
    });
  }

  if (import.meta.env.DEV) {
    console.error("Tracked error:", error, errorInfo);
  }
};

export const trackUserAction = (action, properties = {}) => {
  const event = {
    action,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...properties,
  };

  if (window.gtag) {
    window.gtag("event", action, properties);
  }

  if (import.meta.env.DEV) {
    console.log("User action tracked:", event);
  }
};

export const trackPageView = (path = window.location.pathname) => {
  if (window.gtag) {
    window.gtag("config", "GA_MEASUREMENT_ID", {
      page_path: path,
    });
  }

  if (import.meta.env.DEV) {
    console.log("Page view tracked:", path);
  }
};

/* Backward-compatible alias para hindi mag-crash kapag may ibang file na gumagamit ng pageView() */
export const pageView = trackPageView;