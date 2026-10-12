import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Triggers light tactile feedback for general taps and selections.
 */
export async function triggerTapHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Graceful degradation on unsupported devices
  }
}

/**
 * Triggers success feedback when marking a meal as cooked.
 */
export async function triggerCookHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Graceful degradation on unsupported devices
  }
}

/**
 * Triggers celebratory strong haptic feedback when a full rotation cycle completes.
 */
export async function triggerCycleCompleteHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 150);
  } catch {
    // Graceful degradation on unsupported devices
  }
}
