import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { PlanSuggestion } from '../domain/autoSuggestEngine';
import { formatDisplayDate } from '../utils/date';

interface Props {
  visible: boolean;
  suggestions: PlanSuggestion[];
  onConfirm: () => void;
  onClose: () => void;
}

const MEAL_COLORS: Record<string, { bg: string; text: string }> = {
  breakfast: { bg: '#FEF3C7', text: '#92400E' },
  lunch: { bg: '#E0F2FE', text: '#075985' },
  dinner: { bg: '#F3E8FF', text: '#6B21A8' },
};

export const AutoPlanModal: React.FC<Props> = ({
  visible,
  suggestions,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>7-Day Rotation Plan</Text>
            <Text style={styles.subtitle}>
              Preview suggestions derived from your least-recently cooked dishes. Planned meals
              never advance rotation until cooked.
            </Text>
          </View>

          {suggestions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>All Slots Already Planned</Text>
              <Text style={styles.emptySubtitle}>
                Every meal slot across this 7-day week is already scheduled or logged.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.list}>
              {suggestions.map((item, index) => {
                const colors = MEAL_COLORS[item.mealType] || MEAL_COLORS.dinner;
                return (
                  <View key={`${item.date}_${item.mealType}_${index}`} style={styles.suggestionRow}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.dateLabel}>{formatDisplayDate(item.date)}</Text>
                      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>
                          {item.mealType.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dishName} numberOfLines={1}>
                      {item.dish.name}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            {suggestions.length > 0 && (
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={onConfirm}
                accessibilityRole="button"
                accessibilityLabel="Confirm and apply week suggestions">
                <Text style={styles.confirmBtnText}>
                  Apply {suggestions.length} Meals
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel week plan">
              <Text style={styles.cancelBtnText}>
                {suggestions.length === 0 ? 'Close' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E222B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 18 },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  list: { marginVertical: 8 },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A303C',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', width: 75 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dishName: { fontSize: 14, fontWeight: '600', color: '#F8FAFC', flex: 1, textAlign: 'right' },
  footer: { marginTop: 16, gap: 10 },
  confirmBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#2A303C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
});
