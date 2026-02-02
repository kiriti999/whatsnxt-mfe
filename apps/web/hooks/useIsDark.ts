import { useMantineColorScheme } from '@mantine/core';

/**
 * Custom hook to check if dark mode is enabled
 * 
 * Usage:
 * ```tsx
 * const isDark = useIsDark();
 * ```
 * 
 * This replaces:
 * ```tsx
 * const { colorScheme } = useMantineColorScheme();
 * const isDark = colorScheme === 'dark';
 * ```
 * 
 * @returns {boolean} True if dark mode is enabled, false otherwise
 */
export const useIsDark = (): boolean => {
  const { colorScheme } = useMantineColorScheme();
  return colorScheme === 'dark';
};
