import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';

import YouTubeWebView, { WebViewError } from './src/components/YouTubeWebView';
import NoConnectionScreen from './src/screens/NoConnectionScreen';
import LoadingErrorScreen from './src/screens/LoadingErrorScreen';
import TimeoutScreen from './src/screens/TimeoutScreen';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import { colors } from './src/styles/theme';

// YouTube URL
const YOUTUBE_URL = 'https://www.youtube.com';

type AppState = 'loading' | 'success' | 'offline' | 'error' | 'timeout';

interface ErrorState {
  code?: number;
  message?: string;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [error, setError] = useState<ErrorState>({});
  const [key, setKey] = useState(0); // Used to force WebView reload

  const { isConnected, isInternetReachable, checkConnection } = useNetworkStatus();

  // Check initial connection
  useEffect(() => {
    const checkInitialConnection = async () => {
      const connected = await checkConnection();
      if (!connected) {
        setAppState('offline');
      }
    };
    checkInitialConnection();
  }, [checkConnection]);

  // Monitor connection changes
  useEffect(() => {
    if (isConnected === false || isInternetReachable === false) {
      if (appState !== 'offline') {
        setAppState('offline');
      }
    }
  }, [isConnected, isInternetReachable, appState]);

  const handleRetry = useCallback(async () => {
    const connected = await checkConnection();

    if (!connected) {
      setAppState('offline');
      return;
    }

    // Reset state and reload WebView
    setAppState('loading');
    setError({});
    setKey(prev => prev + 1);
  }, [checkConnection]);

  const handleWebViewError = useCallback((webViewError: WebViewError) => {
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
        // Check if it's actually a network issue
        checkConnection().then(connected => {
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

  const handleLoadStart = useCallback(() => {
    // Only set loading if we're not already showing an error
    if (appState === 'loading' || appState === 'success') {
      setAppState('loading');
    }
  }, [appState]);

  const handleLoadEnd = useCallback(() => {
    // Only set success if we haven't encountered an error
    if (appState === 'loading') {
      setAppState('success');
    }
  }, [appState]);

  const renderContent = () => {
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
            key={key}
            url={YOUTUBE_URL}
            onError={handleWebViewError}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
