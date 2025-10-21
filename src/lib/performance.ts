/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and custom metrics
 */

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
}

/**
 * Web Vitals thresholds
 */
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Calculate metric rating
 */
function getMetricRating(
  name: WebVitalsMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Log metric to console (development) or analytics (production)
 */
function logMetric(metric: WebVitalsMetric | CustomMetric): void {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}:`, metric);
  } else {
    // Send to analytics service in production
    // Example: Google Analytics, Sentry, DataDog, etc.
    sendToAnalytics(metric);
  }
}

/**
 * Send metric to analytics service
 */
function sendToAnalytics(metric: WebVitalsMetric | CustomMetric): void {
  // Implement your analytics integration here
  // Example with Google Analytics:
  // gtag('event', metric.name, {
  //   value: Math.round(metric.value),
  //   metric_rating: 'rating' in metric ? metric.rating : undefined,
  // });

  // Example with custom API:
  // fetch('/api/analytics/metrics', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  // });
}

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point
 */
export async function initPerformanceMonitoring(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    onCLS((metric: any) => logMetric({ ...metric, rating: getMetricRating('CLS', metric.value) }));
    onFID((metric: any) => logMetric({ ...metric, rating: getMetricRating('FID', metric.value) }));
    onFCP((metric: any) => logMetric({ ...metric, rating: getMetricRating('FCP', metric.value) }));
    onLCP((metric: any) => logMetric({ ...metric, rating: getMetricRating('LCP', metric.value) }));
    onTTFB((metric: any) => logMetric({ ...metric, rating: getMetricRating('TTFB', metric.value) }));
    onINP((metric: any) => logMetric({ ...metric, rating: getMetricRating('INP', metric.value) }));
  } catch (error) {
    console.warn('Failed to initialize performance monitoring:', error);
  }
}

/**
 * Track custom performance metric
 */
export function trackMetric(name: string, value: number): void {
  const metric: CustomMetric = {
    name,
    value,
    timestamp: Date.now(),
  };
  logMetric(metric);
}

/**
 * Measure and track function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    trackMetric(`${name}_duration`, duration);
  }
}

/**
 * Create a performance mark
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure duration between two marks
 */
export function measure(name: string, startMark: string, endMark: string): number | null {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      if (entries.length > 0 && entries[0]) {
        const duration = entries[0].duration;
        trackMetric(name, duration);
        return duration;
      }
    } catch (error) {
      console.warn('Failed to measure performance:', error);
    }
  }
  return null;
}

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!perfData) return;

    // DNS lookup time
    trackMetric('dns_lookup', perfData.domainLookupEnd - perfData.domainLookupStart);

    // TCP connection time
    trackMetric('tcp_connection', perfData.connectEnd - perfData.connectStart);

    // Request time
    trackMetric('request_time', perfData.responseStart - perfData.requestStart);

    // Response time
    trackMetric('response_time', perfData.responseEnd - perfData.responseStart);

    // DOM processing time
    trackMetric('dom_processing', perfData.domComplete - perfData.domInteractive);

    // Total load time
    trackMetric('total_load_time', perfData.loadEventEnd - perfData.fetchStart);
  });
}

/**
 * Track API call performance
 */
export function trackAPICall(endpoint: string, duration: number, status: number): void {
  trackMetric(`api_${endpoint.replace(/\//g, '_')}_duration`, duration);
  trackMetric(`api_${endpoint.replace(/\//g, '_')}_status`, status);
}

/**
 * Get performance budget status
 */
export interface PerformanceBudget {
  metric: string;
  budget: number;
  current: number;
  status: 'pass' | 'warn' | 'fail';
}

export function checkPerformanceBudget(): PerformanceBudget[] {
  const budgets: PerformanceBudget[] = [
    { metric: 'LCP', budget: 2500, current: 0, status: 'pass' },
    { metric: 'FID', budget: 100, current: 0, status: 'pass' },
    { metric: 'CLS', budget: 0.1, current: 0, status: 'pass' },
    { metric: 'Bundle Size (KB)', budget: 200, current: 0, status: 'pass' },
  ];

  // This would be populated with actual metrics
  return budgets;
}
