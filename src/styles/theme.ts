import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

// Responsive font sizes
export const fontScale = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export const colors = {
  // YouTube-inspired dark theme
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceLight: '#272727',
  
  // Primary colors
  primary: '#FF0000',
  primaryDark: '#CC0000',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#717171',
  
  // Status colors
  error: '#FF4E45',
  warning: '#FFB800',
  success: '#2ECC71',
  info: '#3498DB',
  
  // Icon colors
  iconDefault: '#909090',
  iconActive: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  title: {
    fontSize: fontScale(28),
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontScale(18),
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: fontScale(16),
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: fontScale(24),
  },
  caption: {
    fontSize: fontScale(14),
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
  button: {
    fontSize: fontScale(16),
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  fontScale,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
};
