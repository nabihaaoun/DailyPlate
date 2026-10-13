import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Dish } from '../../types/dish';
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
import { CategoryFilterPills, DishFilterType } from '../../components/CategoryFilterPills';
import { DishListItem } from '../../components/DishListItem';
import { DishListEmpty } from '../../components/DishListEmpty';
import { SettingsModal } from '../../components/SettingsModal';
import { SearchBar } from '../../components/SearchBar';
import { filterDishes } from '../../domain/dishSearch';
import { triggerTapHaptic } from '../../utils/haptics';

export default function DishesScreen() {
  const dispatch = useAppDispatch();
  const allDishes = useAppSelector((state) => state.dishes.items);

  const breakfastRotation = useAppSelector(selectBreakfastRotation);
  const lunchRotation = useAppSelector(selectLunchRotation);
  const dinnerRotation = useAppSelector(selectDinnerRotation);

  const [activeFilter, setActiveFilter] = useState<DishFilterType>('all_filter');
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [dishToEdit, setDishToEdit] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    return filterDishes(allDishes, search, activeFilter);
  }, [allDishes, activeFilter, search]);

  const handleDeleteDish = (dish: Dish) => {
    Alert.alert('Remove Dish', `Remove "${dish.name}" from active menu?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => dispatch(removeDish(dish.id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Dishes</Text>
            <Text style={styles.subtitle}>{allDishes.length} dishes in collection</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => {
                triggerTapHaptic();
                setIsSettingsVisible(true);
              }}
              accessibilityLabel="Data management and settings">
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                triggerTapHaptic();
                setDishToEdit(null);
                setIsModalVisible(true);
              }}>
              <Text style={styles.addBtnText}>+ Add Dish</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by dish name..."
        />

        <CategoryFilterPills
          activeFilter={activeFilter}
          onSelectFilter={(f) => {
            triggerTapHaptic();
            setActiveFilter(f);
          }}
        />

        {activeFilter === 'breakfast' && (
          <RotationSummaryBar status={breakfastRotation} title="BREAKFAST ROTATION" />
        )}
        {activeFilter === 'lunch' && (
          <RotationSummaryBar status={lunchRotation} title="LUNCH ROTATION" />
        )}
        {activeFilter === 'dinner' && (
          <RotationSummaryBar status={dinnerRotation} title="DINNER ROTATION" />
        )}

        <FlatList
          data={filteredDishes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <DishListItem
              dish={item}
              onEdit={(d) => {
                setDishToEdit(d);
                setIsModalVisible(true);
              }}
              onDelete={handleDeleteDish}
            />
          )}
          ListEmptyComponent={
            <DishListEmpty
              searchQuery={search}
              totalDishesCount={allDishes.length}
              onSeedDishes={() => dispatch(seedSampleDishes())}
            />
          }
        />
      </View>

      <DishFormModal
        visible={isModalVisible}
        dishToEdit={dishToEdit}
        defaultCategory={activeFilter !== 'all_filter' ? activeFilter : 'dinner'}
        onSaveSingle={(name, category) =>
          dishToEdit
            ? dispatch(updateDish({ id: dishToEdit.id, name, category }))
            : dispatch(addDish({ name, category }))
        }
        onSaveBatch={(names, category) =>
          dispatch(addBatchDishes(names.map((name) => ({ name, category }))))
        }
        onClose={() => setIsModalVisible(false)}
      />

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsIcon: {
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  searchInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  listContent: { paddingBottom: 24, paddingTop: 4 },
});
