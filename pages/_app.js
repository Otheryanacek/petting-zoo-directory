import { useEffect } from 'react';
import { useRouter } from 'next/router';
import "../styles/globals.css";
import NavBar from "../components/NavBar";
import GoogleAnalytics from "../components/GoogleAnalytics";
import MonitoringDashboard from "../components/MonitoringDashboard";
import ErrorBoundary from "../components/ErrorBoundary";
import { pageview } from '../lib/analytics';
import { initPerformanceMonitoring } from '../lib/performance';

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Track page views
    const handleRouteChange = (url) => {
      pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('hashChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('hashChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <GoogleAnalytics />
      <ErrorBoundary>
        <NavBar />
        <Component {...pageProps} />
      </ErrorBoundary>
      <MonitoringDashboard />
    </>
  );
};

export default MyApp;
