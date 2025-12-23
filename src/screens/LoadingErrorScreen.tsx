import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

interface LoadingErrorScreenProps {
    onRetry: () => void;
    errorCode?: number;
    errorMessage?: string;
}

const { width } = Dimensions.get('window');

const LoadingErrorScreen: React.FC<LoadingErrorScreenProps> = ({
    onRetry,
    errorCode,
    errorMessage
}) => {
    const shakeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const shake = Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]);
        shake.start();
    }, [shakeAnim]);

    const getErrorDetails = () => {
        switch (errorCode) {
            case 404:
                return {
                    title: 'Página no encontrada',
                    description: 'El contenido que buscas no está disponible o fue eliminado.',
                };
            case 500:
            case 502:
            case 503:
                return {
                    title: 'Error del servidor',
                    description: 'YouTube está experimentando problemas técnicos. Intenta más tarde.',
                };
            case 403:
                return {
                    title: 'Acceso denegado',
                    description: 'No tienes permiso para ver este contenido.',
                };
            default:
                return {
                    title: 'Error al cargar',
                    description: errorMessage || 'No se pudo cargar el contenido de YouTube.',
                };
        }
    };

    const { title, description } = getErrorDetails();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Error Icon */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        { transform: [{ translateX: shakeAnim }] }
                    ]}
                >
                    <View style={styles.errorIcon}>
                        <View style={styles.triangleOuter}>
                            <View style={styles.triangleInner}>
                                <Text style={styles.exclamation}>!</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Error Code Badge */}
                {errorCode && (
                    <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>Error {errorCode}</Text>
                    </View>
                )}

                {/* Text Content */}
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{description}</Text>

                {/* Error Details Card */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
                        <Text style={styles.detailText}>No se pudo establecer conexión con YouTube</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                        <Text style={styles.detailText}>Puede ser un problema temporal</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={onRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

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
        maxWidth: width * 0.85,
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
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.full,
        ...shadows.medium,
    },
    retryButtonText: {
        ...typography.button,
        color: colors.textPrimary,
    },
});

export default LoadingErrorScreen;
