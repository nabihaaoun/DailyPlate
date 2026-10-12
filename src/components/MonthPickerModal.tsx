import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { parseDateString, formatDateString } from '../utils/date';

interface Props {
  visible: boolean;
  selectedDate: string;
  onSelectMonth: (dateStr: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MonthPickerModal: React.FC<Props> = ({
  visible,
  selectedDate,
  onSelectMonth,
  onClose,
}) => {
  const initialDate = parseDateString(selectedDate);
  const [year, setYear] = useState<number>(initialDate.getFullYear());
  const selectedMonthIndex = initialDate.getMonth();
  const selectedYear = initialDate.getFullYear();

  const handlePickMonth = (monthIndex: number) => {
    const target = new Date(year, monthIndex, 1);
    onSelectMonth(formatDateString(target));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setYear((y) => y - 1)}
              accessibilityLabel="Previous year">
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.yearTitle}>{year}</Text>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setYear((y) => y + 1)}
              accessibilityLabel="Next year">
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Months Grid */}
          <View style={styles.grid}>
            {MONTH_NAMES.map((name, idx) => {
              const isSelected = year === selectedYear && idx === selectedMonthIndex;
              return (
                <TouchableOpacity
                  key={name}
                  style={[styles.monthCell, isSelected && styles.selectedMonthCell]}
                  onPress={() => handlePickMonth(idx)}>
                  <Text
                    style={[
                      styles.monthCellText,
                      isSelected && styles.selectedMonthCellText,
                    ]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  navBtnText: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthCell: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedMonthCell: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  monthCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  selectedMonthCellText: {
    color: '#0F172A',
  },
  closeBtn: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
