import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workoutService } from '../../../services/workout.service';
import { WorkoutPlan } from '../../../types/workout';

const phaseTypeLabels: Record<string, string> = {
  warmup: '🔥 热身', main: '💪 正式训练', cooldown: '❄️ 放松拉伸',
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
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.title}</Text>
        {plan.description && <Text style={styles.desc}>{plan.description}</Text>}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Text style={styles.metaValue}>{plan.duration}</Text><Text style={styles.metaLabel}>分钟</Text></View>
          <View style={styles.metaItem}><Text style={styles.metaValue}>{plan.caloriesBurned}</Text><Text style={styles.metaLabel}>千卡</Text></View>
          <View style={styles.metaItem}><Text style={styles.metaValue}>{plan.difficulty}</Text><Text style={styles.metaLabel}>难度</Text></View>
        </View>
      </View>
      {plan.phases?.map((phase) => (
        <View key={phase.id} style={styles.phaseSection}>
          <Text style={styles.phaseTitle}>{phaseTypeLabels[phase.type] || phase.name} ({phase.duration} 分钟)</Text>
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
      <Pressable style={({pressed}) => [styles.startButton, pressed && {opacity: 0.7}]} onPress={() => router.push(`/workout/train/${plan.id}`)}>
        <Text style={styles.startButtonText}>开始训练</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  header: { backgroundColor: '#2D2D44', padding: 24, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  desc: { fontSize: 14, color: '#A0A0B0', marginTop: 8 },
  metaRow: { flexDirection: 'row', marginTop: 16, gap: 24 },
  metaItem: { alignItems: 'center' },
  metaValue: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B' },
  metaLabel: { fontSize: 12, color: '#6B6B80', marginTop: 2 },
  phaseSection: { marginTop: 16, paddingHorizontal: 16 },
  phaseTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  exerciseItem: { flexDirection: 'row', backgroundColor: '#2D2D44', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#3D3D5C' },
  exerciseNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  exerciseNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  exerciseContent: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  exerciseDesc: { fontSize: 13, color: '#A0A0B0', marginTop: 4 },
  exerciseMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  exerciseMetaText: { fontSize: 13, color: '#FF8E53', fontWeight: '500' },
  startButton: { backgroundColor: '#FF6B6B', marginHorizontal: 16, marginTop: 24, borderRadius: 12, padding: 16, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
