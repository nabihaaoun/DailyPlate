import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  emptySlotsCount: number;
  onPressAutoFillDay: () => void;
  onPressOpenWeekPlanner: () => void;
}

export const AutoPlanActionsBar: React.FC<Props> = ({
  emptySlotsCount,
  onPressAutoFillDay,
  onPressOpenWeekPlanner,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.actionBtn, emptySlotsCount === 0 && styles.disabledBtn]}
        onPress={onPressAutoFillDay}
        disabled={emptySlotsCount === 0}
        accessibilityRole="button"
        accessibilityLabel="Auto-fill empty slots for selected day">
        <Text style={[styles.actionBtnText, emptySlotsCount === 0 && styles.disabledBtnText]}>
          ⚡ {emptySlotsCount > 0 ? `Fill Day (${emptySlotsCount})` : 'Day Filled'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.weekBtn]}
        onPress={onPressOpenWeekPlanner}
        accessibilityRole="button"
        accessibilityLabel="Open 7-day week auto-planner">
        <Text style={[styles.actionBtnText, styles.weekBtnText]}>
          📅 7-Day Auto-Plan
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
  },
  weekBtn: {
    backgroundColor: '#1E1B4B',
    borderColor: '#4338CA',
  },
  weekBtnText: {
    color: '#C7D2FE',
  },
  disabledBtn: {
    opacity: 0.5,
    borderColor: '#1E293B',
  },
  disabledBtnText: {
    color: '#64748B',
  },
});
