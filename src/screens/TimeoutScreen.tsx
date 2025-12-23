import React, { memo, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Easing,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface TimeoutScreenProps {
    onRetry: () => void;
}

// Pre-computed hour marker degrees - created once, never recreated
const HOUR_MARKER_DEGREES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;

// Memoized Hour Marker
const HourMarker = memo(({ deg }: { deg: number }) => (
    <View
        style={[
            styles.hourMarker,
            { transform: [{ rotate: `${deg}deg` }, { translateY: -32 }] }
        ]}
    />
));

// Memoized Clock Face (static parts)
const ClockMarkers = memo(() => (
    <>
        {HOUR_MARKER_DEGREES.map((deg) => (
            <HourMarker key={deg} deg={deg} />
        ))}
    </>
));

// Memoized Suggestion Item
const SuggestionItem = memo(({ text }: { text: string }) => (
    <Text style={styles.suggestion}>{text}</Text>
));

// Memoized Quality Bars
const QualityBars = memo(() => (
    <View style={styles.qualityBars}>
        <View style={[styles.qualityBar, styles.qualityBarActive]} />
        <View style={[styles.qualityBar, styles.qualityBarWeak]} />
        <View style={styles.qualityBar} />
        <View style={styles.qualityBar} />
    </View>
));

// Memoized Suggestions Section
const SuggestionsSection = memo(() => (
    <View style={styles.suggestionList}>
        <SuggestionItem text="• Cambia a una red WiFi más estable" />
        <SuggestionItem text="• Acércate al router" />
        <SuggestionItem text="• Cierra otras apps que usen internet" />
        <SuggestionItem text="• Intenta de nuevo en unos momentos" />
    </View>
));

const TimeoutScreen: React.FC<TimeoutScreenProps> = memo(({ onRetry }) => {
    const spinAnim = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const spinAnimRef = React.useRef<Animated.CompositeAnimation | null>(null);

    React.useEffect(() => {
        // Spin animation - store reference for cleanup
        spinAnimRef.current = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spinAnimRef.current.start();

        // Fade in animation - one-time, no need to store
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        return () => {
            if (spinAnimRef.current) {
                spinAnimRef.current.stop();
            }
            spinAnim.setValue(0);
            fadeAnim.setValue(0);
        };
    }, []);

    // Memoize interpolation
    const spinInterpolation = useMemo(() =>
        spinAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        }), [spinAnim]
    );

    // Memoize animated styles
    const clockHandStyle = useMemo(() => ({
        transform: [{ rotate: spinInterpolation }]
    }), [spinInterpolation]);

    const contentStyle = useMemo(() => ({
        opacity: fadeAnim
    }), [fadeAnim]);

    // Memoize handler
    const handleRetry = useCallback(() => {
        onRetry();
    }, [onRetry]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, contentStyle]}>
                {/* Clock Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.clockFace}>
                        <Animated.View style={[styles.clockHand, clockHandStyle]} />
                        <View style={styles.clockCenter} />
                        <ClockMarkers />
                    </View>
                </View>

                {/* Text Content */}
                <Text style={styles.title}>Tiempo de espera agotado</Text>
                <Text style={styles.subtitle}>
                    La conexión está tardando demasiado.{'\n'}
                    Puede que tu internet esté lento.
                </Text>

                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={styles.pulsingDot} />
                        <Text style={styles.statusTitle}>Conexión lenta detectada</Text>
                    </View>

                    <SuggestionsSection />

                    {/* Connection Quality Indicator */}
                    <View style={styles.qualityContainer}>
                        <Text style={styles.qualityLabel}>Calidad de conexión:</Text>
                        <QualityBars />
                        <Text style={styles.qualityText}>Débil</Text>
                    </View>
                </View>

                {/* Retry Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.retryButton,
                        pressed && styles.retryButtonPressed
                    ]}
                    onPress={handleRetry}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    content: {
        alignItems: 'center',
        width: '85%',
        maxWidth: 400,
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        ...shadows.large,
    },
    clockFace: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: colors.warning,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockHand: {
        position: 'absolute',
        width: 3,
        height: 25,
        backgroundColor: colors.warning,
        borderRadius: 2,
        top: 10,
    },
    clockCenter: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: colors.warning,
        borderRadius: 4,
    },
    hourMarker: {
        position: 'absolute',
        width: 2,
        height: 6,
        backgroundColor: colors.textMuted,
    },
    title: {
        ...typography.title,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    statusCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        width: '100%',
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    pulsingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.warning,
        marginRight: spacing.sm,
    },
    statusTitle: {
        ...typography.subtitle,
        color: colors.warning,
        fontSize: 14,
    },
    suggestionList: {
        marginBottom: spacing.md,
    },
    suggestion: {
        ...typography.caption,
        color: colors.textSecondary,
        marginVertical: 3,
    },
    qualityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
    },
    qualityLabel: {
        ...typography.caption,
        color: colors.textMuted,
        marginRight: spacing.sm,
    },
    qualityBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginRight: spacing.sm,
    },
    qualityBar: {
        width: 4,
        backgroundColor: colors.textMuted,
        marginHorizontal: 1,
        borderRadius: 1,
        height: 16,
        opacity: 0.3,
    },
    qualityBarActive: {
        height: 6,
        backgroundColor: colors.warning,
        opacity: 1,
    },
    qualityBarWeak: {
        height: 10,
        backgroundColor: colors.warning,
        opacity: 0.6,
    },
    qualityText: {
        ...typography.caption,
        color: colors.warning,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.full,
        ...shadows.medium,
    },
    retryButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    retryButtonText: {
        ...typography.button,
        color: colors.textPrimary,
    },
});

export default TimeoutScreen;
