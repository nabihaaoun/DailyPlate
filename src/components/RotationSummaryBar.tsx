import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryRotationStatus } from '../types/rotation';

interface Props {
  status: CategoryRotationStatus;
  title?: string;
}

export const RotationSummaryBar: React.FC<Props> = ({ status, title }) => {
  const { totalEligible, completedCount, remainingCount } = status;

  if (totalEligible === 0) return null;

  const percentage = Math.round((completedCount / totalEligible) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title || `${status.mealType.toUpperCase()} ROTATION`}</Text>
        <Text style={styles.countText}>
          {remainingCount} of {totalEligible} left
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.hint}>
        {completedCount === 0
          ? 'Fresh rotation cycle — all dishes available!'
          : `${completedCount} cooked so far in this cycle`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E222B',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#9CA3AF',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  hint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },
});
