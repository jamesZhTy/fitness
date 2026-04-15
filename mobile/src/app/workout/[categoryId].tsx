import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workoutService } from '../../services/workout.service';
import { WorkoutPlan } from '../../types/workout';

const difficultyColors: Record<string, string> = {
  beginner: '#4CAF50', intermediate: '#FF9800', advanced: '#F44336',
};

export default function PlansScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    workoutService.getPlansByCategory(categoryId, filter || undefined)
      .then((data) => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [categoryId, filter]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
          <TouchableOpacity key={d}
            style={[styles.filterChip, (filter === d || (d === 'all' && !filter)) && styles.filterChipActive]}
            onPress={() => setFilter(d === 'all' ? null : d)}>
            <Text style={[styles.filterText, (filter === d || (d === 'all' && !filter)) && styles.filterTextActive]}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : (
        <FlatList data={plans} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No plans found</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/workout/plan/${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: difficultyColors[item.difficulty] || '#999' }]}>
                  <Text style={styles.badgeText}>{item.difficulty}</Text>
                </View>
              </View>
              {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>{item.duration} min</Text>
                <Text style={styles.metaText}>{item.caloriesBurned} kcal</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', padding: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#4CAF50' },
  filterText: { fontSize: 13, color: '#666' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardDesc: { fontSize: 14, color: '#666', marginTop: 8 },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaText: { fontSize: 13, color: '#999' },
});
