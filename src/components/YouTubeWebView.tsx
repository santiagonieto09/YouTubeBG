import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef, memo, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Animated,
    BackHandler,
    Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { WebViewErrorEvent, WebViewHttpErrorEvent } from 'react-native-webview/lib/WebViewTypes';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { colors } from '../styles/theme';
import { getUrlBlocker, getScriptInjector } from '../adblock';

export interface WebViewError {
    type: 'http' | 'load' | 'timeout';
    code?: number;
    description?: string;
}

export interface YouTubeWebViewRef {
    goBack: () => boolean;
    canGoBack: () => boolean;
}

interface YouTubeWebViewProps {
    url: string;
    onError: (error: WebViewError) => void;
    onLoadStart: () => void;
    onLoadEnd: () => void;
    timeoutDuration?: number;
}

// Initialize ad blocker services (singleton pattern)
const urlBlocker = getUrlBlocker();
const scriptInjector = getScriptInjector();

// Get injection scripts once
const INJECTED_JAVASCRIPT = scriptInjector.getInjectedJavaScript();
const PRELOAD_SCRIPT = scriptInjector.getPreloadScript();

// Static WebView config
const WEBVIEW_CONFIG = {
    javaScriptEnabled: true,
    domStorageEnabled: true,
    startInLoadingState: false,
    scalesPageToFit: true,
    allowsFullscreenVideo: true,
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    allowsBackForwardNavigationGestures: true,
    scrollEnabled: true,
    bounces: true,
    nestedScrollEnabled: true,
    overScrollMode: 'never' as const,
    setBuiltInZoomControls: false,
    setDisplayZoomControls: false,
    originWhitelist: ['https://*', 'http://*'] as string[],
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    mixedContentMode: 'compatibility' as const,
    allowFileAccess: true,
    cacheEnabled: true,
    cacheMode: 'LOAD_DEFAULT' as const,
    // Ad blocking scripts
    injectedJavaScript: INJECTED_JAVASCRIPT,
    injectedJavaScriptBeforeContentLoaded: PRELOAD_SCRIPT,
};

// Memoized Loading Indicator
const LoadingIndicator = memo(() => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;
    const animRef = useRef<Animated.CompositeAnimation | null>(null);

    React.useEffect(() => {
        animRef.current = Animated.loop(
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
        animRef.current.start();

        return () => {
            if (animRef.current) {
                animRef.current.stop();
            }
            pulseAnim.setValue(0.3);
        };
    }, []);

    const animatedStyle = useMemo(() => ({ opacity: pulseAnim }), [pulseAnim]);

    return (
        <View style={styles.loadingContainer}>
            <Animated.View style={[styles.youtubeLogoContainer, animatedStyle]}>
                <View style={styles.youtubeLogo}>
                    <View style={styles.playButton} />
                </View>
            </Animated.View>
            <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        </View>
    );
});

const YouTubeWebView = memo(forwardRef<YouTubeWebViewRef, YouTubeWebViewProps>(({
    url,
    onError,
    onLoadStart,
    onLoadEnd,
    timeoutDuration = 15000,
}, ref) => {
    const webViewRef = useRef<WebView>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [canGoBackState, setCanGoBackState] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isMountedRef = useRef(true);

    // Expose goBack method to parent
    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (canGoBackState && webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            }
            return false;
        },
        canGoBack: () => canGoBackState,
    }), [canGoBackState]);

    const clearTimeoutHandler = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const handleLoadStart = useCallback(() => {
        if (!isMountedRef.current) return;

        if (isInitialLoad) {
            onLoadStart();
            clearTimeoutHandler();
            timeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    onError({ type: 'timeout' });
                }
            }, timeoutDuration);
        }
    }, [isInitialLoad, onLoadStart, onError, timeoutDuration, clearTimeoutHandler]);

    const handleLoadEnd = useCallback(() => {
        if (!isMountedRef.current) return;

        clearTimeoutHandler();

        if (isInitialLoad) {
            setIsInitialLoad(false);
            onLoadEnd();

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isInitialLoad, onLoadEnd, fadeAnim, clearTimeoutHandler]);

    const handleError = useCallback((event: WebViewErrorEvent) => {
        if (!isMountedRef.current) return;

        clearTimeoutHandler();

        if (isInitialLoad) {
            onError({
                type: 'load',
                description: event.nativeEvent.description,
            });
        }
    }, [isInitialLoad, onError, clearTimeoutHandler]);

    const handleHttpError = useCallback((event: WebViewHttpErrorEvent) => {
        if (!isMountedRef.current) return;

        clearTimeoutHandler();
        const statusCode = event.nativeEvent.statusCode;

        if (statusCode >= 400 && isInitialLoad) {
            onError({
                type: 'http',
                code: statusCode,
                description: event.nativeEvent.description,
            });
        }
    }, [isInitialLoad, onError, clearTimeoutHandler]);

    const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        if (!isMountedRef.current) return;
        setCanGoBackState(navState.canGoBack);
    }, []);

    /**
     * URL Interception Handler - Primary Ad Blocking Defense
     * Intercepts all URL requests and blocks ad-related ones
     */
    const handleShouldStartLoadWithRequest = useCallback((request: ShouldStartLoadRequest): boolean => {
        const { url: requestUrl } = request;

        // Check if URL should be blocked
        const result = urlBlocker.shouldBlock(requestUrl);

        if (result.blocked) {
            // URL is blocked - don't load it
            return false;
        }

        // URL is allowed - proceed with loading
        return true;
    }, []);

    // Mount/unmount tracking and cleanup
    React.useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            clearTimeoutHandler();
        };
    }, [clearTimeoutHandler]);

    // Handle Android back button
    React.useEffect(() => {
        if (Platform.OS !== 'android') return;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (canGoBackState && webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [canGoBackState]);

    // Memoize animated container style
    const animatedContainerStyle = useMemo(() => [
        styles.webViewContainer,
        { opacity: isInitialLoad ? 0 : fadeAnim }
    ], [isInitialLoad, fadeAnim]);

    // Memoize source object
    const source = useMemo(() => ({ uri: url }), [url]);

    return (
        <View style={styles.container}>
            <Animated.View style={animatedContainerStyle}>
                <WebView
                    ref={webViewRef}
                    source={source}
                    style={styles.webView}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    onHttpError={handleHttpError}
                    onNavigationStateChange={handleNavigationStateChange}
                    onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                    {...WEBVIEW_CONFIG}
                />
            </Animated.View>

            {isInitialLoad && (
                <View style={styles.loadingOverlay}>
                    <LoadingIndicator />
                </View>
            )}
        </View>
    );
}));

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
