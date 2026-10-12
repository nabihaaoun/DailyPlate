import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import {
  triggerTapHaptic,
  triggerCookHaptic,
  triggerCycleCompleteHaptic,
} from '../haptics';

vi.mock('expo-haptics', () => ({
  selectionAsync: vi.fn(),
  notificationAsync: vi.fn(),
  impactAsync: vi.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
  ImpactFeedbackStyle: {
    Heavy: 'heavy',
  },
}));

describe('Haptics Micro-Interaction Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('H-1: triggerTapHaptic calls selectionAsync on mobile', async () => {
    await triggerTapHaptic();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('H-2: triggerTapHaptic skips on web', async () => {
    Platform.OS = 'web';
    await triggerTapHaptic();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('H-3: triggerCookHaptic calls notificationAsync with Success on mobile', async () => {
    await triggerCookHaptic();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('H-4: triggerCycleCompleteHaptic calls impactAsync with Heavy', async () => {
    await triggerCycleCompleteHaptic();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    );
  });

  it('H-5: Gracefully handles unsupported device rejections without throwing', async () => {
    vi.mocked(Haptics.selectionAsync).mockRejectedValueOnce(new Error('Haptics not supported'));
    await expect(triggerTapHaptic()).resolves.toBeUndefined();
  });
});
