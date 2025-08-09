// Google Analytics configuration and utilities

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Custom events for petting zoo interactions
export const trackZooView = (zooName, zooId) => {
  event({
    action: 'view_zoo',
    category: 'engagement',
    label: zooName,
    value: zooId,
  });
};

export const trackSearch = (searchTerm, resultsCount) => {
  event({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultsCount,
  });
};

export const trackFilter = (filterType, filterValue) => {
  event({
    action: 'filter',
    category: 'engagement',
    label: `${filterType}:${filterValue}`,
  });
};

export const trackMapInteraction = (action, zooName) => {
  event({
    action: `map_${action}`,
    category: 'map',
    label: zooName,
  });
};

export const trackReviewSubmission = (zooName, rating) => {
  event({
    action: 'submit_review',
    category: 'engagement',
    label: zooName,
    value: rating,
  });
};