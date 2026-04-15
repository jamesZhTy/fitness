import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workoutService } from '../../services/workout.service';
import { WorkoutPlan } from '../../types/workout';

const difficultyColors: Record<string, string> = {
  beginner: '#00E676', intermediate: '#FF8E53', advanced: '#FF5252',
};

export default function PlansScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    workoutService.getPlansByCategory(categoryId, filter || undefined)
      .then((data) => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [categoryId, filter]);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
          <Pressable key={d}
            style={({pressed}) => [styles.filterChip, (filter === d || (d === 'all' && !filter)) && styles.filterChipActive, pressed && {opacity: 0.7}]}
            onPress={() => setFilter(d === 'all' ? null : d)}>
            <Text style={[styles.filterText, (filter === d || (d === 'all' && !filter)) && styles.filterTextActive]}>
              {{ all: '全部', beginner: '入门', intermediate: '进阶', advanced: '高级' }[d]}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>
      ) : (
        <FlatList data={plans} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>暂无训练计划</Text>}
          renderItem={({ item }) => (
            <Pressable style={({pressed}) => [styles.card, pressed && {opacity: 0.7}]} onPress={() => router.push(`/workout/plan/${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: difficultyColors[item.difficulty] || '#999' }]}>
                  <Text style={styles.badgeText}>{item.difficulty}</Text>
                </View>
              </View>
              {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>{item.duration} 分钟</Text>
                <Text style={styles.metaText}>{item.caloriesBurned} 千卡</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  topBar: { paddingHorizontal: 16, paddingBottom: 4, backgroundColor: '#1A1A2E' },
  backButton: {},
  backButtonText: { color: '#FF6B6B', fontSize: 16, fontWeight: '500' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  filterRow: { flexDirection: 'row', padding: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#2D2D44' },
  filterChipActive: { backgroundColor: '#FF6B6B' },
  filterText: { fontSize: 13, color: '#6B6B80' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  emptyText: { textAlign: 'center', color: '#6B6B80', marginTop: 40 },
  card: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#3D3D5C', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardDesc: { fontSize: 14, color: '#A0A0B0', marginTop: 8 },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaText: { fontSize: 13, color: '#6B6B80' },
});
