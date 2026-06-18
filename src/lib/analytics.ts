export type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[];
  }
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });
}

export function getLeadMetadata(
  payload: AnalyticsPayload & {
    ctaSource: string;
    pageSection: string;
    unitSelected?: string;
  },
) {
  if (typeof window === "undefined") {
    return payload;
  }

  const params = new URLSearchParams(window.location.search);
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  return {
    ...payload,
    deviceType: isMobile ? "mobile" : "desktop",
    landingPage: window.location.href,
    referrer: document.referrer || "direct",
    fbclid: params.get("fbclid"),
    gclid: params.get("gclid"),
    msclkid: params.get("msclkid"),
    timestamp: new Date().toISOString(),
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmTerm: params.get("utm_term"),
    utmContent: params.get("utm_content"),
  };
}
