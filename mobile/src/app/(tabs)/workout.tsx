import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { workoutService } from '../../services/workout.service';
import { WorkoutCategory } from '../../types/workout';

const categoryImages: Record<string, string> = {
  '跑步': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop',
  '瑜伽': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
  '力量': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop',
  '拉伸': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
  'HIIT': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=400&fit=crop',
};

export default function WorkoutScreen() {
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    workoutService.getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={({pressed}) => [styles.card, pressed && {opacity: 0.7}]} onPress={() => router.push(`/workout/${item.id}`)}>
            <Image source={{ uri: categoryImages[item.name] }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  list: { padding: 16 },
  card: { borderRadius: 12, marginBottom: 12, height: 160, overflow: 'hidden', justifyContent: 'flex-end', elevation: 2 },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  cardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});
