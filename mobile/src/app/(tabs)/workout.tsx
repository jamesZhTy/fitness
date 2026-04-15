import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { workoutService } from '../../services/workout.service';
import { WorkoutCategory } from '../../types/workout';

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
            <Text style={styles.icon}>{item.icon || '🏋️'}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#3D3D5C', elevation: 2 },
  icon: { fontSize: 36, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  cardDesc: { fontSize: 14, color: '#A0A0B0', marginTop: 4 },
  arrow: { fontSize: 24, color: '#6B6B80' },
});
