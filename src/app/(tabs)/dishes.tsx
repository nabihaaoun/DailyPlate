import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Dish, MealCategory } from '../../types/dish';
import {
  addDish,
  addBatchDishes,
  updateDish,
  removeDish,
  seedSampleDishes,
} from '../../store/slices/dishesSlice';
import {
  selectBreakfastRotation,
  selectLunchRotation,
  selectDinnerRotation,
} from '../../store/slices/rotationSelectors';
import { RotationSummaryBar } from '../../components/RotationSummaryBar';
import { DishFormModal } from '../../components/DishFormModal';

const FILTER_TABS: { label: string; value: MealCategory | 'all_filter' }[] = [
  { label: 'All', value: 'all_filter' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
];

export default function DishesScreen() {
  const dispatch = useAppDispatch();
  const allDishes = useAppSelector((state) => state.dishes.items);

  const breakfastRotation = useAppSelector(selectBreakfastRotation);
  const lunchRotation = useAppSelector(selectLunchRotation);
  const dinnerRotation = useAppSelector(selectDinnerRotation);

  const [activeFilter, setActiveFilter] = useState<MealCategory | 'all_filter'>('all_filter');
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dishToEdit, setDishToEdit] = useState<Dish | null>(null);

  // Filtered dishes
  const filteredDishes = allDishes.filter((dish) => {
    const matchesFilter =
      activeFilter === 'all_filter' ||
      dish.category === activeFilter ||
      dish.category === 'all';
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase().trim());
    return matchesFilter && matchesSearch;
  });

  const handleOpenAdd = () => {
    setDishToEdit(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (dish: Dish) => {
    setDishToEdit(dish);
    setIsModalVisible(true);
  };

  const handleDeleteDish = (dish: Dish) => {
    Alert.alert(
      'Remove Dish',
      `Are you sure you want to remove "${dish.name}" from your active menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeDish(dish.id)),
        },
      ]
    );
  };

  const handleSaveSingle = async (name: string, category: MealCategory) => {
    if (dishToEdit) {
      await dispatch(updateDish({ id: dishToEdit.id, name, category }));
    } else {
      await dispatch(addDish({ name, category }));
    }
  };

  const handleSaveBatch = async (names: string[], category: MealCategory) => {
    const inputs = names.map((name) => ({ name, category }));
    await dispatch(addBatchDishes(inputs));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Dishes</Text>
            <Text style={styles.subtitle}>{allDishes.length} total dishes in collection</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Text style={styles.addBtnText}>+ Add Dish</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by dish name..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>

        {/* Category Filters */}
        <View style={styles.tabsRow}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tabChip, activeFilter === tab.value && styles.activeTabChip]}
              onPress={() => setActiveFilter(tab.value)}>
              <Text
                style={[
                  styles.tabChipText,
                  activeFilter === tab.value && styles.activeTabChipText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rotation progress overview */}
        {activeFilter === 'breakfast' && (
          <RotationSummaryBar status={breakfastRotation} title="BREAKFAST ROTATION" />
        )}
        {activeFilter === 'lunch' && (
          <RotationSummaryBar status={lunchRotation} title="LUNCH ROTATION" />
        )}
        {activeFilter === 'dinner' && (
          <RotationSummaryBar status={dinnerRotation} title="DINNER ROTATION" />
        )}

        {/* Dish List */}
        <FlatList
          data={filteredDishes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.dishCard}>
              <View style={styles.dishDetails}>
                <Text style={styles.dishName}>{item.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.dishActions}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleOpenEdit(item)}>
                  <Text style={styles.actionEditText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleDeleteDish(item)}>
                  <Text style={styles.actionDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No dishes found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search term.' : 'Add your favorite dishes to get started.'}
              </Text>
              {allDishes.length === 0 && (
                <TouchableOpacity
                  style={styles.seedButton}
                  onPress={() => dispatch(seedSampleDishes())}>
                  <Text style={styles.seedButtonText}>Load Starter Dishes</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Dish Form Modal */}
      <DishFormModal
        visible={isModalVisible}
        dishToEdit={dishToEdit}
        defaultCategory={activeFilter !== 'all_filter' ? activeFilter : 'dinner'}
        onSaveSingle={handleSaveSingle}
        onSaveBatch={handleSaveBatch}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeTabChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  dishCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E222B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  dishDetails: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  dishActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    padding: 6,
  },
  actionEditText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  actionDeleteText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  seedButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  seedButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
});
