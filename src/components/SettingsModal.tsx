import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
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

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cookedCount = Object.values(mealsMap).filter((m) => m.status === 'completed').length;
  const plannedCount = Object.values(mealsMap).filter((m) => m.status === 'planned').length;

  /**
   * Danger Zone: Clear Local App Data with double confirmation
   */
  const handleClearLocalData = () => {
    // Confirmation 1
    Alert.alert(
      'Clear Local App Data',
      'This will permanently delete all your custom dishes and meal history from this device. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            // Confirmation 2 (Double confirmation safeguard)
            Alert.alert(
              'Final Confirmation',
              'This action cannot be undone. All rotation progress and saved dishes will be permanently wiped.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Wipe Everything',
                  style: 'destructive',
                  onPress: async () => {
                    await resetDatabaseToCleanState();
                    await dispatch(loadDishes());
                    await dispatch(loadAllMeals());
                    await triggerTapHaptic();
                    setStatusMessage('Local data cleared successfully.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  /**
   * Developer tools handlers (Available in DEV mode only)
   */
  const handleExportDev = async () => {
    try {
      const backup = await exportDatabaseBackup();
      const stringified = JSON.stringify(backup, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(stringified);
      }
      await triggerCookHaptic();
      setStatusMessage(`Backup copied to clipboard (${backup.dishes.length} dishes, ${backup.meals.length} meals)`);
      Alert.alert(
        'Backup Exported',
        `Database backup with ${backup.dishes.length} dishes and ${backup.meals.length} meals has been copied to your clipboard.`
      );
    } catch {
      Alert.alert('Error', 'Failed to generate database backup');
    }
  };

  const handleImportDev = async () => {
    try {
      let rawJson = '';
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        rawJson = await navigator.clipboard.readText();
      }
      if (!rawJson.trim()) {
        Alert.alert(
          'Import Backup',
          'Copy your backup JSON to your clipboard first, then tap Import to restore your data.'
        );
        return;
      }
      const parsed = JSON.parse(rawJson.trim());
      const result = await importDatabaseBackup(parsed);
      await dispatch(loadDishes());
      await dispatch(loadAllMeals());
      await triggerCookHaptic();
      setStatusMessage(`Restored ${result.dishesCount} dishes and ${result.mealsCount} meals!`);
      Alert.alert(
        'Restore Complete',
        `Successfully restored ${result.dishesCount} dishes and ${result.mealsCount} meals from clipboard backup.`
      );
    } catch {
      Alert.alert(
        'Import Failed',
        'Could not read valid backup JSON from clipboard. Please ensure valid backup JSON is copied.'
      );
    }
  };

  const handleReloadStarterDishesDev = async () => {
    await dispatch(seedSampleDishes());
    await triggerCookHaptic();
    setStatusMessage('Starter dishes loaded into menu!');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Data & Settings</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close settings modal">
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* 1. Summary Statistics Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{allDishes.length}</Text>
                <Text style={styles.statLabel}>Dishes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{cookedCount}</Text>
                <Text style={styles.statLabel}>Cooked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{plannedCount}</Text>
                <Text style={styles.statLabel}>Planned</Text>
              </View>
            </View>

            {statusMessage && <Text style={styles.statusBanner}>{statusMessage}</Text>}

            {/* 2. App & Storage Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>About DailyPlate</Text>
              <Text style={styles.infoText}>
                Version 1.0 • 100% Offline SQLite Storage
              </Text>
              <Text style={styles.infoSubtext}>
                All dishes, rotation records, and meal plans are stored locally on this device.
                No data is sent to external servers.
              </Text>
            </View>

            {/* 3. Dedicated Danger Zone */}
            <View style={styles.dangerZoneCard}>
              <Text style={styles.dangerZoneTitle}>DANGER ZONE</Text>
              <Text style={styles.dangerZoneDescription}>
                Permanently delete all custom dishes, meal history, and planned rotations from
                this device.
              </Text>
              <TouchableOpacity
                style={styles.btnDanger}
                onPress={handleClearLocalData}
                accessibilityRole="button"
                accessibilityLabel="Clear Local App Data">
                <Text style={styles.btnDangerText}>🗑️ Clear Local App Data</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Developer & Debug Tools (Rendered ONLY in development) */}
            {__DEV__ && (
              <View style={styles.devSection}>
                <View style={styles.devHeaderRow}>
                  <Text style={styles.devTitle}>DEVELOPER TOOLS</Text>
                  <View style={styles.devBadge}>
                    <Text style={styles.devBadgeText}>DEV ONLY</Text>
                  </View>
                </View>
                <View style={styles.devActionsList}>
                  <TouchableOpacity
                    style={styles.btnDev}
                    onPress={handleExportDev}
                    accessibilityRole="button"
                    accessibilityLabel="Export JSON Backup">
                    <Text style={styles.btnDevText}>📦 Export JSON Backup</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDev}
                    onPress={handleImportDev}
                    accessibilityRole="button"
                    accessibilityLabel="Import JSON Backup">
                    <Text style={styles.btnDevText}>📥 Import JSON Backup</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDev}
                    onPress={handleReloadStarterDishesDev}
                    accessibilityRole="button"
                    accessibilityLabel="Reload Starter Dishes">
                    <Text style={styles.btnDevText}>🍲 Reload Starter Dishes</Text>
                  </TouchableOpacity>
                </View>
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
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  infoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  dangerZoneCard: {
    backgroundColor: '#261214',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  dangerZoneTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F87171',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  dangerZoneDescription: {
    fontSize: 12,
    color: '#FCA5A5',
    lineHeight: 16,
    marginBottom: 14,
    opacity: 0.9,
  },
  btnDanger: {
    backgroundColor: '#7F1D1D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDangerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  devSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  devHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  devTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  devBadge: {
    backgroundColor: '#3730A3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  devBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C7D2FE',
  },
  devActionsList: {
    gap: 8,
  },
  btnDev: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnDevText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
});
