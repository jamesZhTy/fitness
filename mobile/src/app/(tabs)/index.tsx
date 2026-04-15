import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { workoutService } from '../../services/workout.service';
import { WorkoutCategory } from '../../types/workout';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    workoutService.getCategories().then((data) => { setCategories(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hi, {user?.username || 'Fitness Lover'} 👋</Text>
        <Text style={styles.greetingSubtext}>Ready to work out today?</Text>
      </View>
      <Text style={styles.sectionTitle}>Workout Categories</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.gridCard} onPress={() => router.push(`/workout/${cat.id}`)}>
              <Text style={styles.gridIcon}>{cat.icon || '🏋️'}</Text>
              <Text style={styles.gridLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  greeting: { backgroundColor: '#4CAF50', padding: 24, paddingTop: 16, paddingBottom: 30 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  greetingSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 20, marginLeft: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridCard: { width: '46%', margin: '2%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  gridIcon: { fontSize: 40 },
  gridLabel: { fontSize: 15, fontWeight: '500', color: '#333', marginTop: 8 },
});
