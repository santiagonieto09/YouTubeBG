import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import YouTubeWebView, { WebViewError, YouTubeWebViewRef } from './src/components/YouTubeWebView';
import NoConnectionScreen from './src/screens/NoConnectionScreen';
import LoadingErrorScreen from './src/screens/LoadingErrorScreen';
import TimeoutScreen from './src/screens/TimeoutScreen';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import { colors } from './src/styles/theme';

// YouTube URL - Static constant
const YOUTUBE_URL = 'https://music.youtube.com/';

type AppState = 'loading' | 'success' | 'offline' | 'error' | 'timeout';

interface ErrorState {
  code?: number;
  message?: string;
}

// Initial error state - created once
const INITIAL_ERROR_STATE: ErrorState = {};

const AppContent = memo(() => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [error, setError] = useState<ErrorState>(INITIAL_ERROR_STATE);
  const [key, setKey] = useState(0);
  const webViewRef = useRef<YouTubeWebViewRef>(null);
  const insets = useSafeAreaInsets();
  const isMountedRef = useRef(true);

  const { isConnected, isInternetReachable, checkConnection } = useNetworkStatus();

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check initial connection
  useEffect(() => {
    const checkInitialConnection = async () => {
      const connected = await checkConnection();
      if (!connected && isMountedRef.current) {
        setAppState('offline');
      }
    };
    checkInitialConnection();
  }, [checkConnection]);

  // Monitor connection changes - optimized to reduce unnecessary updates
  useEffect(() => {
    if (!isMountedRef.current) return;

    const isOffline = isConnected === false || isInternetReachable === false;
    if (isOffline) {
      setAppState(prev => prev === 'offline' ? prev : 'offline');
    }
  }, [isConnected, isInternetReachable]);

  const handleRetry = useCallback(async () => {
    if (!isMountedRef.current) return;

    const connected = await checkConnection();

    if (!connected) {
      setAppState('offline');
      return;
    }

    // Reset state and reload WebView
    setAppState('loading');
    setError(INITIAL_ERROR_STATE);
    setKey(prev => prev + 1);
  }, [checkConnection]);

  const handleWebViewError = useCallback((webViewError: WebViewError) => {
    if (!isMountedRef.current) return;

    switch (webViewError.type) {
      case 'timeout':
        setAppState('timeout');
        break;
      case 'http':
        setAppState('error');
        setError({
          code: webViewError.code,
          message: webViewError.description,
        });
        break;
      case 'load':
        checkConnection().then(connected => {
          if (!isMountedRef.current) return;

          if (!connected) {
            setAppState('offline');
          } else {
            setAppState('error');
            setError({ message: webViewError.description });
          }
        });
        break;
    }
  }, [checkConnection]);

  // Simplified handlers - avoid unnecessary state updates
  const handleLoadStart = useCallback(() => {
    // No-op: Initial load state is managed internally by WebView
  }, []);

  const handleLoadEnd = useCallback(() => {
    if (!isMountedRef.current) return;
    setAppState(prev => prev === 'loading' ? 'success' : prev);
  }, []);

  // Memoize safe area styles
  const topPaddingStyle = useMemo(() => [
    styles.statusBarPadding,
    { height: insets.top, backgroundColor: colors.background }
  ], [insets.top]);

  const bottomPaddingStyle = useMemo(() => [
    styles.bottomPadding,
    { height: insets.bottom, backgroundColor: colors.background }
  ], [insets.bottom]);

  // Memoize content rendering to prevent unnecessary re-renders
  const content = useMemo(() => {
    switch (appState) {
      case 'offline':
        return <NoConnectionScreen onRetry={handleRetry} />;

      case 'timeout':
        return <TimeoutScreen onRetry={handleRetry} />;

      case 'error':
        return (
          <LoadingErrorScreen
            onRetry={handleRetry}
            errorCode={error.code}
            errorMessage={error.message}
          />
        );

      case 'loading':
      case 'success':
      default:
        return (
          <YouTubeWebView
            ref={webViewRef}
            key={key}
            url={YOUTUBE_URL}
            onError={handleWebViewError}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
          />
        );
    }
  }, [appState, handleRetry, error.code, error.message, key, handleWebViewError, handleLoadStart, handleLoadEnd]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={topPaddingStyle} />
      <View style={styles.content}>
        {content}
      </View>
      <View style={bottomPaddingStyle} />
    </View>
  );
});

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusBarPadding: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  bottomPadding: {
    width: '100%',
  },
});

export default memo(App);
