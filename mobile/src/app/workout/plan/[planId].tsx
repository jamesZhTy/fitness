import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workoutService } from '../../../services/workout.service';
import { WorkoutPlan } from '../../../types/workout';

const phaseTypeLabels: Record<string, string> = {
  warmup: '🔥 Warm-up', main: '💪 Main Training', cooldown: '❄️ Cool-down',
};

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}m ${sec}s` : `${min} min`;
  }
  return `${seconds}s`;
}

export default function PlanDetailScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!planId) return;
    workoutService.getPlanById(planId).then((data) => { setPlan(data); setLoading(false); }).catch(() => setLoading(false));
  }, [planId]);

  if (loading || !plan) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.title}</Text>
        {plan.description && <Text style={styles.desc}>{plan.description}</Text>}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Text style={styles.metaValue}>{plan.duration}</Text><Text style={styles.metaLabel}>min</Text></View>
          <View style={styles.metaItem}><Text style={styles.metaValue}>{plan.caloriesBurned}</Text><Text style={styles.metaLabel}>kcal</Text></View>
          <View style={styles.metaItem}><Text style={styles.metaValue}>{plan.difficulty}</Text><Text style={styles.metaLabel}>level</Text></View>
        </View>
      </View>
      {plan.phases?.map((phase) => (
        <View key={phase.id} style={styles.phaseSection}>
          <Text style={styles.phaseTitle}>{phaseTypeLabels[phase.type] || phase.name} ({phase.duration} min)</Text>
          {phase.exercises?.map((exercise, idx) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{idx + 1}</Text></View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {exercise.description && <Text style={styles.exerciseDesc}>{exercise.description}</Text>}
                <View style={styles.exerciseMeta}>
                  {exercise.duration && <Text style={styles.exerciseMetaText}>⏱ {formatDuration(exercise.duration)}</Text>}
                  {exercise.sets && exercise.reps && <Text style={styles.exerciseMetaText}>{exercise.sets} x {exercise.reps}</Text>}
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
      <TouchableOpacity style={styles.startButton} onPress={() => router.push(`/workout/train/${plan.id}`)}>
        <Text style={styles.startButtonText}>Start Training</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4CAF50', padding: 24, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  metaRow: { flexDirection: 'row', marginTop: 16, gap: 24 },
  metaItem: { alignItems: 'center' },
  metaValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  metaLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  phaseSection: { marginTop: 16, paddingHorizontal: 16 },
  phaseTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  exerciseItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8 },
  exerciseNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  exerciseNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  exerciseContent: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '500', color: '#333' },
  exerciseDesc: { fontSize: 13, color: '#666', marginTop: 4 },
  exerciseMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  exerciseMetaText: { fontSize: 13, color: '#4CAF50', fontWeight: '500' },
  startButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginTop: 24, borderRadius: 12, padding: 16, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
