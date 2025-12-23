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

interface NoConnectionScreenProps {
    onRetry: () => void;
}

const { width } = Dimensions.get('window');

const NoConnectionScreen: React.FC<NoConnectionScreenProps> = ({ onRetry }) => {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        const pulse = Animated.loop(
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
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* WiFi Icon */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                >
                    <View style={styles.wifiIcon}>
                        <View style={[styles.wifiArc, styles.wifiArc1]} />
                        <View style={[styles.wifiArc, styles.wifiArc2]} />
                        <View style={[styles.wifiArc, styles.wifiArc3]} />
                        <View style={styles.wifiDot} />
                        <View style={styles.crossLine} />
                    </View>
                </Animated.View>

                {/* Text Content */}
                <Text style={styles.title}>Sin conexión a Internet</Text>
                <Text style={styles.subtitle}>
                    No se puede conectar a YouTube.{'\n'}
                    Verifica tu conexión y vuelve a intentarlo.
                </Text>

                {/* Tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipTitle}>Sugerencias:</Text>
                    <Text style={styles.tip}>• Activa el WiFi o los datos móviles</Text>
                    <Text style={styles.tip}>• Comprueba la configuración de red</Text>
                    <Text style={styles.tip}>• Reinicia el router si es necesario</Text>
                </View>

                {/* Retry Button */}
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
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
    retryButtonText: {
        ...typography.button,
        color: colors.textPrimary,
    },
});

export default NoConnectionScreen;
