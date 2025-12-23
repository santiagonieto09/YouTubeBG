import React, { memo, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Pressable,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface NoConnectionScreenProps {
    onRetry: () => void;
}

// Memoized TipItem to prevent re-renders
const TipItem = memo(({ text }: { text: string }) => (
    <Text style={styles.tip}>{text}</Text>
));

// Memoized WiFi Icon component - static, no need to re-render
const WiFiIcon = memo(() => (
    <View style={styles.wifiIcon}>
        <View style={[styles.wifiArc, styles.wifiArc1]} />
        <View style={[styles.wifiArc, styles.wifiArc2]} />
        <View style={[styles.wifiArc, styles.wifiArc3]} />
        <View style={styles.wifiDot} />
        <View style={styles.crossLine} />
    </View>
));

// Memoized Tips container
const TipsSection = memo(() => (
    <View style={styles.tipsContainer}>
        <Text style={styles.tipTitle}>Sugerencias:</Text>
        <TipItem text="• Activa el WiFi o los datos móviles" />
        <TipItem text="• Comprueba la configuración de red" />
        <TipItem text="• Reinicia el router si es necesario" />
    </View>
));

const NoConnectionScreen: React.FC<NoConnectionScreenProps> = memo(({ onRetry }) => {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

    React.useEffect(() => {
        // Create animation only once
        animationRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animationRef.current.start();

        return () => {
            // Proper cleanup
            if (animationRef.current) {
                animationRef.current.stop();
            }
            pulseAnim.setValue(1);
        };
    }, []);

    // Memoize the transform style
    const animatedStyle = useMemo(() => ({
        transform: [{ scale: pulseAnim }]
    }), [pulseAnim]);

    // Memoize retry handler
    const handleRetry = useCallback(() => {
        onRetry();
    }, [onRetry]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Animated Icon Container */}
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <WiFiIcon />
                </Animated.View>

                {/* Text Content - Static */}
                <Text style={styles.title}>Sin conexión a Internet</Text>
                <Text style={styles.subtitle}>
                    No se puede conectar a YouTube.{'\n'}
                    Verifica tu conexión y vuelve a intentarlo.
                </Text>

                {/* Tips Section - Memoized */}
                <TipsSection />

                {/* Retry Button - Use Pressable for better performance */}
                <Pressable
                    style={({ pressed }) => [
                        styles.retryButton,
                        pressed && styles.retryButtonPressed
                    ]}
                    onPress={handleRetry}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
            </View>
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
    wifiIcon: {
        width: 60,
        height: 60,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    wifiArc: {
        position: 'absolute',
        borderWidth: 4,
        borderColor: colors.textMuted,
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderRadius: 100,
    },
    wifiArc1: {
        width: 60,
        height: 60,
        top: 0,
    },
    wifiArc2: {
        width: 40,
        height: 40,
        top: 12,
    },
    wifiArc3: {
        width: 20,
        height: 20,
        top: 24,
    },
    wifiDot: {
        width: 8,
        height: 8,
        backgroundColor: colors.textMuted,
        borderRadius: borderRadius.full,
        marginBottom: 5,
    },
    crossLine: {
        position: 'absolute',
        width: 70,
        height: 4,
        backgroundColor: colors.error,
        transform: [{ rotate: '-45deg' }],
        top: 28,
        borderRadius: 2,
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
    tipsContainer: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        width: '100%',
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    tipTitle: {
        ...typography.subtitle,
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    tip: {
        ...typography.caption,
        marginVertical: spacing.xs,
        color: colors.textSecondary,
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

export default NoConnectionScreen;
