import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { workoutService } from '../../services/workout.service';
import { WorkoutCategory } from '../../types/workout';

const categoryImages: Record<string, string> = {
  '跑步': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop',
  '瑜伽': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
  '力量': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop',
  '拉伸': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
  'HIIT': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=400&fit=crop',
};

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
              <Image
                source={{ uri: categoryImages[cat.name] }}
                style={styles.gridImage}
                resizeMode="cover"
              />
              <View style={styles.gridOverlay} />
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
  gridCard: { width: '46%', margin: '2%', borderRadius: 12, height: 140, overflow: 'hidden', elevation: 2, justifyContent: 'flex-end', alignItems: 'center' },
  gridImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', borderRadius: 12 },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12 },
  gridLabel: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
});
