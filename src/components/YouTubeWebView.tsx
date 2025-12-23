import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { WebViewErrorEvent, WebViewHttpErrorEvent } from 'react-native-webview/lib/WebViewTypes';
import { colors } from '../styles/theme';

export interface WebViewError {
    type: 'http' | 'load' | 'timeout';
    code?: number;
    description?: string;
}

interface YouTubeWebViewProps {
    url: string;
    onError: (error: WebViewError) => void;
    onLoadStart: () => void;
    onLoadEnd: () => void;
    timeoutDuration?: number;
}

const YouTubeWebView: React.FC<YouTubeWebViewProps> = ({
    url,
    onError,
    onLoadStart,
    onLoadEnd,
    timeoutDuration = 15000, // 15 seconds default
}) => {
    const webViewRef = useRef<WebView>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const clearTimeoutHandler = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const handleLoadStart = useCallback(() => {
        setIsLoading(true);
        onLoadStart();

        // Set timeout
        clearTimeoutHandler();
        timeoutRef.current = setTimeout(() => {
            onError({ type: 'timeout' });
        }, timeoutDuration);
    }, [onLoadStart, onError, timeoutDuration, clearTimeoutHandler]);

    const handleLoadEnd = useCallback(() => {
        clearTimeoutHandler();
        setIsLoading(false);
        onLoadEnd();

        // Fade in WebView
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [onLoadEnd, fadeAnim, clearTimeoutHandler]);

    const handleError = useCallback((event: WebViewErrorEvent) => {
        clearTimeoutHandler();
        setIsLoading(false);
        onError({
            type: 'load',
            description: event.nativeEvent.description,
        });
    }, [onError, clearTimeoutHandler]);

    const handleHttpError = useCallback((event: WebViewHttpErrorEvent) => {
        clearTimeoutHandler();
        const statusCode = event.nativeEvent.statusCode;

        // Only treat 4xx and 5xx as errors
        if (statusCode >= 400) {
            setIsLoading(false);
            onError({
                type: 'http',
                code: statusCode,
                description: event.nativeEvent.description,
            });
        }
    }, [onError, clearTimeoutHandler]);

    const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        // Optional: Handle navigation state changes
        console.log('Navigation:', navState.url);
    }, []);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            clearTimeoutHandler();
        };
    }, [clearTimeoutHandler]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.webViewContainer, { opacity: fadeAnim }]}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    style={styles.webView}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    onHttpError={handleHttpError}
                    onNavigationStateChange={handleNavigationStateChange}

                    // WebView Configuration
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}

                    // Security
                    originWhitelist={['https://*', 'http://*']}

                    // User Agent (optional, for better compatibility)
                    userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"

                    // Rendering
                    renderLoading={() => <LoadingIndicator />}
                />
            </Animated.View>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <LoadingIndicator />
                </View>
            )}
        </View>
    );
};

const LoadingIndicator: React.FC = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    return (
        <View style={styles.loadingContainer}>
            <Animated.View style={[styles.youtubeLogoContainer, { opacity: pulseAnim }]}>
                <View style={styles.youtubeLogo}>
                    <View style={styles.playButton} />
                </View>
            </Animated.View>
            <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    webViewContainer: {
        flex: 1,
    },
    webView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    youtubeLogoContainer: {
        marginBottom: 20,
    },
    youtubeLogo: {
        width: 80,
        height: 56,
        backgroundColor: colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 0,
        height: 0,
        borderLeftWidth: 20,
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderLeftColor: colors.textPrimary,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginLeft: 5,
    },
    spinner: {
        marginTop: 10,
    },
});

export default YouTubeWebView;
