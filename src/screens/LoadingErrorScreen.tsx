import React, { memo, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface LoadingErrorScreenProps {
    onRetry: () => void;
    errorCode?: number;
    errorMessage?: string;
}

// Memoized Error Icon - static component
const ErrorIcon = memo(() => (
    <View style={styles.errorIcon}>
        <View style={styles.triangleOuter}>
            <View style={styles.triangleInner}>
                <Text style={styles.exclamation}>!</Text>
            </View>
        </View>
    </View>
));

// Memoized Status Row
const StatusRow = memo(({ color, text }: { color: string; text: string }) => (
    <View style={styles.detailRow}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={styles.detailText}>{text}</Text>
    </View>
));

// Error details lookup - moved outside component to avoid recreation
const ERROR_DETAILS: Record<number, { title: string; description: string }> = {
    404: {
        title: 'Página no encontrada',
        description: 'El contenido que buscas no está disponible o fue eliminado.',
    },
    403: {
        title: 'Acceso denegado',
        description: 'No tienes permiso para ver este contenido.',
    },
    500: {
        title: 'Error del servidor',
        description: 'YouTube está experimentando problemas técnicos. Intenta más tarde.',
    },
    502: {
        title: 'Error del servidor',
        description: 'YouTube está experimentando problemas técnicos. Intenta más tarde.',
    },
    503: {
        title: 'Error del servidor',
        description: 'YouTube está experimentando problemas técnicos. Intenta más tarde.',
    },
};

const DEFAULT_ERROR = {
    title: 'Error al cargar',
    description: 'No se pudo cargar el contenido de YouTube.',
};

const LoadingErrorScreen: React.FC<LoadingErrorScreenProps> = memo(({
    onRetry,
    errorCode,
    errorMessage
}) => {
    const shakeAnim = React.useRef(new Animated.Value(0)).current;
    const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

    React.useEffect(() => {
        animationRef.current = Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]);
        animationRef.current.start();

        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
            shakeAnim.setValue(0);
        };
    }, []);

    // Memoize error details computation
    const errorDetails = useMemo(() => {
        if (errorCode && ERROR_DETAILS[errorCode]) {
            return ERROR_DETAILS[errorCode];
        }
        return {
            title: DEFAULT_ERROR.title,
            description: errorMessage || DEFAULT_ERROR.description,
        };
    }, [errorCode, errorMessage]);

    // Memoize animated style
    const animatedStyle = useMemo(() => ({
        transform: [{ translateX: shakeAnim }]
    }), [shakeAnim]);

    // Memoize handler
    const handleRetry = useCallback(() => {
        onRetry();
    }, [onRetry]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Animated Error Icon */}
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <ErrorIcon />
                </Animated.View>

                {/* Error Code Badge */}
                {errorCode && (
                    <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>Error {errorCode}</Text>
                    </View>
                )}

                {/* Text Content */}
                <Text style={styles.title}>{errorDetails.title}</Text>
                <Text style={styles.subtitle}>{errorDetails.description}</Text>

                {/* Error Details Card */}
                <View style={styles.detailsCard}>
                    <StatusRow color={colors.error} text="No se pudo establecer conexión con YouTube" />
                    <StatusRow color={colors.warning} text="Puede ser un problema temporal" />
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
        marginBottom: spacing.lg,
        ...shadows.large,
    },
    errorIcon: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    triangleOuter: {
        width: 0,
        height: 0,
        borderLeftWidth: 35,
        borderRightWidth: 35,
        borderBottomWidth: 60,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.warning,
        justifyContent: 'center',
        alignItems: 'center',
    },
    triangleInner: {
        position: 'absolute',
        bottom: -52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exclamation: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.background,
    },
    codeBadge: {
        backgroundColor: colors.error,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        marginBottom: spacing.md,
    },
    codeText: {
        ...typography.caption,
        color: colors.textPrimary,
        fontWeight: '600',
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
    detailsCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        width: '100%',
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xs,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    detailText: {
        ...typography.caption,
        color: colors.textSecondary,
        flex: 1,
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

export default LoadingErrorScreen;
