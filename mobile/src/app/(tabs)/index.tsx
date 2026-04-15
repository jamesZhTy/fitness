import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
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
        <Text style={styles.greetingText}>你好, {user?.username || '健身达人'} 👋</Text>
        <Text style={styles.greetingSubtext}>今天准备好训练了吗？</Text>
      </View>
      <Text style={styles.sectionTitle}>训练分类</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.grid}>
          {categories.map((cat) => (
            <Pressable key={cat.id} style={({pressed}) => [styles.gridCard, pressed && {opacity: 0.7}]} onPress={() => router.push(`/workout/${cat.id}`)}>
              <Text style={styles.gridIcon}>{cat.icon || '🏋️'}</Text>
              <Text style={styles.gridLabel}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  greeting: { backgroundColor: '#2D2D44', padding: 24, paddingTop: 16, paddingBottom: 30 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  greetingSubtext: { fontSize: 14, color: '#A0A0B0', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginTop: 20, marginLeft: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridCard: { width: '46%', margin: '2%', backgroundColor: '#2D2D44', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C', elevation: 2 },
  gridIcon: { fontSize: 40 },
  gridLabel: { fontSize: 15, fontWeight: '500', color: '#FFFFFF', marginTop: 8 },
});
