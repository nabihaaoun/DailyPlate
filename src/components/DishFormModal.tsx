import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Dish, MealCategory } from '../types/dish';

interface Props {
  visible: boolean;
  dishToEdit?: Dish | null;
  defaultCategory?: MealCategory;
  onSaveSingle: (name: string, category: MealCategory) => void;
  onSaveBatch: (names: string[], category: MealCategory) => void;
  onClose: () => void;
}

const CATEGORIES: { label: string; value: MealCategory }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Any Meal', value: 'all' },
];

interface FormInnerProps {
  dishToEdit?: Dish | null;
  defaultCategory: MealCategory;
  onSaveSingle: (name: string, category: MealCategory) => void;
  onSaveBatch: (names: string[], category: MealCategory) => void;
  onClose: () => void;
}

const DishFormInner: React.FC<FormInnerProps> = ({
  dishToEdit,
  defaultCategory,
  onSaveSingle,
  onSaveBatch,
  onClose,
}) => {
  const [name, setName] = useState(dishToEdit ? dishToEdit.name : '');
  const [category, setCategory] = useState<MealCategory>(
    dishToEdit ? dishToEdit.category : defaultCategory
  );
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchText, setBatchText] = useState('');

  const handleSave = () => {
    if (isBatchMode) {
      const lines = batchText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (lines.length > 0) {
        onSaveBatch(lines, category);
        onClose();
      }
    } else {
      if (name.trim().length > 0) {
        onSaveSingle(name.trim(), category);
        onClose();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {dishToEdit ? 'Edit Dish' : isBatchMode ? 'Add Multiple Dishes' : 'Add New Dish'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle mode if creating */}
        {!dishToEdit && (
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabBtn, !isBatchMode && styles.activeTabBtn]}
              onPress={() => setIsBatchMode(false)}>
              <Text style={[styles.tabText, !isBatchMode && styles.activeTabText]}>
                Single Dish
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, isBatchMode && styles.activeTabBtn]}
              onPress={() => setIsBatchMode(true)}>
              <Text style={[styles.tabText, isBatchMode && styles.activeTabText]}>
                Add Multiple
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Selector */}
        <Text style={styles.label}>Meal Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                category === cat.value && styles.activeCategoryChip,
              ]}
              onPress={() => setCategory(cat.value)}>
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.value && styles.activeCategoryChipText,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name input or batch input */}
        {isBatchMode ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dish Names (one per line)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              numberOfLines={5}
              placeholder={`Chicken Biryani\nPalak Paneer\nDaal Chawal`}
              placeholderTextColor="#6B7280"
              value={batchText}
              onChangeText={setBatchText}
              textAlignVertical="top"
            />
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dish Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aloo Paratha, Chicken Karahi"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isBatchMode && !name.trim()) || (isBatchMode && !batchText.trim())
              ? styles.disabledSaveBtn
              : null,
          ]}
          disabled={(!isBatchMode && !name.trim()) || (isBatchMode && !batchText.trim())}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {dishToEdit ? 'Save Changes' : isBatchMode ? 'Add Dishes' : 'Create Dish'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DishFormModal: React.FC<Props> = ({
  visible,
  dishToEdit,
  defaultCategory = 'dinner',
  onSaveSingle,
  onSaveBatch,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <DishFormInner
          key={dishToEdit ? `edit_${dishToEdit.id}` : `new_${defaultCategory}`}
          dishToEdit={dishToEdit}
          defaultCategory={defaultCategory}
          onSaveSingle={onSaveSingle}
          onSaveBatch={onSaveBatch}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#1F2937',
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: '#374151',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  categoryChip: {
    backgroundColor: '#1F2937',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activeCategoryChip: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F9FAFB',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledSaveBtn: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
