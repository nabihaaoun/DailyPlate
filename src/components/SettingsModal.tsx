import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadDishes, seedSampleDishes } from '../store/slices/dishesSlice';
import { loadAllMeals } from '../store/slices/mealsSlice';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabaseToCleanState,
} from '../db/dataManagementRepository';
import { triggerCookHaptic, triggerTapHaptic } from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const allDishes = useAppSelector((state) => state.dishes.items);
  const mealsMap = useAppSelector((state) => state.meals.meals);

  const [jsonText, setJsonText] = useState('');
  const [showJsonBox, setShowJsonBox] = useState<'export' | 'import' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cookedCount = Object.values(mealsMap).filter((m) => m.status === 'completed').length;
  const plannedCount = Object.values(mealsMap).filter((m) => m.status === 'planned').length;

  const handleExport = async () => {
    try {
      const backup = await exportDatabaseBackup();
      const stringified = JSON.stringify(backup, null, 2);
      setJsonText(stringified);
      setShowJsonBox('export');
      setStatusMessage('Backup generated! Copy the JSON text below:');
      await triggerTapHaptic();
    } catch {
      Alert.alert('Error', 'Failed to generate database backup');
    }
  };

  const handleImport = async () => {
    try {
      if (!jsonText.trim()) {
        Alert.alert('Error', 'Please paste valid backup JSON text.');
        return;
      }
      const parsed = JSON.parse(jsonText.trim());
      const result = await importDatabaseBackup(parsed);
      await dispatch(loadDishes());
      await dispatch(loadAllMeals());
      await triggerCookHaptic();
      setStatusMessage(`Restored ${result.dishesCount} dishes and ${result.mealsCount} meals!`);
      setShowJsonBox(null);
      setJsonText('');
    } catch (err: any) {
      Alert.alert('Import Failed', err.message || 'Invalid backup JSON format.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your custom dishes and meal history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetDatabaseToCleanState();
            await dispatch(loadDishes());
            await dispatch(loadAllMeals());
            await triggerTapHaptic();
            setStatusMessage('Database has been completely reset.');
            setShowJsonBox(null);
            setJsonText('');
          },
        },
      ]
    );
  };

  const handleReloadStarterDishes = async () => {
    await dispatch(seedSampleDishes());
    await triggerCookHaptic();
    setStatusMessage('Starter dishes loaded into menu!');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Data & Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{allDishes.length}</Text>
                <Text style={styles.statLabel}>Dishes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{cookedCount}</Text>
                <Text style={styles.statLabel}>Cooked</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{plannedCount}</Text>
                <Text style={styles.statLabel}>Planned</Text>
              </View>
            </View>

            {statusMessage && <Text style={styles.statusBanner}>{statusMessage}</Text>}

            {/* Actions */}
            <View style={styles.actionsList}>
              <TouchableOpacity style={styles.btnSecondary} onPress={handleExport}>
                <Text style={styles.btnText}>📦 Export JSON Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => {
                  setShowJsonBox('import');
                  setJsonText('');
                  setStatusMessage('Paste your backup JSON below and tap Restore:');
                }}>
                <Text style={styles.btnText}>📥 Import JSON Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSecondary} onPress={handleReloadStarterDishes}>
                <Text style={styles.btnText}>🍲 Reload Starter Dishes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnDanger} onPress={handleReset}>
                <Text style={styles.btnDangerText}>⚠️ Reset Database</Text>
              </TouchableOpacity>
            </View>

            {/* Text box for export / import */}
            {showJsonBox && (
              <View style={styles.jsonBoxContainer}>
                <TextInput
                  style={styles.jsonInput}
                  multiline
                  value={jsonText}
                  onChangeText={setJsonText}
                  placeholder={
                    showJsonBox === 'import' ? 'Paste backup JSON here...' : 'Backup JSON'
                  }
                  placeholderTextColor="#64748B"
                  selectTextOnFocus
                />
                {showJsonBox === 'import' && (
                  <TouchableOpacity style={styles.restoreBtn} onPress={handleImport}>
                    <Text style={styles.restoreBtnText}>Restore Data</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    marginBottom: 10,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'space-around',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  statusBanner: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#064E3B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    textAlign: 'center',
  },
  actionsList: {
    gap: 10,
    marginBottom: 16,
  },
  btnSecondary: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDanger: {
    backgroundColor: '#451A1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    marginTop: 6,
  },
  btnDangerText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '700',
  },
  jsonBoxContainer: {
    marginTop: 10,
  },
  jsonInput: {
    height: 120,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
  },
  restoreBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  restoreBtnText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
});
