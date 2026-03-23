import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, setUserId, setUserProperties } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB4bUEXxI7avq3IkmL7kGdHWwHbSTMYtvQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fir-analytics-93a48.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fir-analytics-93a48',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fir-analytics-93a48.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '923986500891',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:923986500891:web:3fda555fec8f0208c807be',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-SEDSQJ6HDF',
};

const app = initializeApp(firebaseConfig);
let analyticsInstancePromise;

async function getAnalyticsInstance() {
  if (!analyticsInstancePromise) {
    analyticsInstancePromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsInstancePromise;
}

export async function trackEvent(eventName, params = {}) {
  const analytics = await getAnalyticsInstance();
  if (!analytics) {
    console.warn(`[analytics] Firebase Analytics is not supported in this environment. Event skipped: ${eventName}`);
    return;
  }

  logEvent(analytics, eventName, {
    ...params,
    debug_mode: false,
  });
}

export async function identifyUser(userId, properties = {}) {
  const analytics = await getAnalyticsInstance();
  if (!analytics) {
    return;
  }

  setUserId(analytics, userId);
  setUserProperties(analytics, properties);
}

export { app, firebaseConfig };
