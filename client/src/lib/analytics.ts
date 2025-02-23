import { Analytics } from "@vercel/analytics/react";
import Plausible from "plausible-tracker";

// declare global {
//   interface Window {
//     plausible: Plausible.PlausibleInstance;
//   }
// }

// Initialize Plausible
const plausible = Plausible({
  domain: window.location.hostname,
  trackLocalhost: true,
});

// Custom events for tracking
export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  try {
    plausible.trackEvent(eventName, { props });
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Track page view with referrer
export const trackPageView = (url: string) => {
  const referrer = document.referrer;
  const utmSource = new URLSearchParams(window.location.search).get(
    "utm_source"
  );
  const utmMedium = new URLSearchParams(window.location.search).get(
    "utm_medium"
  );
  const utmCampaign = new URLSearchParams(window.location.search).get(
    "utm_campaign"
  );

  trackEvent("pageview", {
    url,
    referrer,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  });
};

// Track signup events
export const trackSignup = (source: string) => {
  trackEvent("signup", { source });
};

// Track referral clicks
export const trackReferral = (referralCode: string) => {
  trackEvent("referral_share", { referral_code: referralCode });
};

// Initialize Plausible tracking
plausible.enableAutoPageviews();

export { Analytics };
