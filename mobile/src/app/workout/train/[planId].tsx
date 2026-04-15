import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workoutService } from '../../../services/workout.service';
import { WorkoutPlan, Exercise } from '../../../types/workout';

interface FlatExercise { exercise: Exercise; phaseName: string; phaseType: string; }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TrainingScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<FlatExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!planId) return;
    workoutService.getPlanById(planId).then((data) => {
      setPlan(data);
      const flat: FlatExercise[] = [];
      data.phases?.forEach((phase) => {
        phase.exercises?.forEach((ex) => {
          flat.push({ exercise: ex, phaseName: phase.name, phaseType: phase.type });
        });
      });
      setExercises(flat);
      if (flat.length > 0 && flat[0].exercise.duration) setTimeLeft(flat[0].exercise.duration);
    });
  }, [planId]);

  const handleNext = useCallback(() => {
    if (currentIndex >= exercises.length - 1) { setIsFinished(true); return; }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    const nextEx = exercises[nextIndex];
    setTimeLeft(nextEx?.exercise.duration ? nextEx.exercise.duration : 0);
    setIsPaused(false);
  }, [currentIndex, exercises]);

  useEffect(() => {
    if (isPaused || isFinished || exercises.length === 0) return;
    const current = exercises[currentIndex];
    if (!current.exercise.duration) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleNext(); return 0; }
        return prev - 1;
      });
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, isPaused, isFinished, exercises, handleNext]);

  const handleSkip = () => { if (timerRef.current) clearInterval(timerRef.current); handleNext(); };
  const handlePause = () => { setIsPaused(!isPaused); if (timerRef.current) clearInterval(timerRef.current); };
  const handleQuit = () => {
    Alert.alert('Quit Training', 'Are you sure you want to quit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => { if (timerRef.current) clearInterval(timerRef.current); router.back(); } },
    ]);
  };

  if (!plan || exercises.length === 0) {
    return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  if (isFinished) {
    return (
      <View style={styles.finishContainer}>
        <Text style={styles.finishIcon}>🎉</Text>
        <Text style={styles.finishTitle}>Great Job!</Text>
        <Text style={styles.finishSubtitle}>{plan.title} completed</Text>
        <View style={styles.finishStats}>
          <View style={styles.finishStatItem}><Text style={styles.finishStatValue}>{formatTime(totalElapsed)}</Text><Text style={styles.finishStatLabel}>Duration</Text></View>
          <View style={styles.finishStatItem}><Text style={styles.finishStatValue}>{plan.caloriesBurned}</Text><Text style={styles.finishStatLabel}>kcal</Text></View>
          <View style={styles.finishStatItem}><Text style={styles.finishStatValue}>{exercises.length}</Text><Text style={styles.finishStatLabel}>Exercises</Text></View>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}><Text style={styles.doneButtonText}>Done</Text></TouchableOpacity>
      </View>
    );
  }

  const current = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
      <Text style={styles.phaseLabel}>{current.phaseName}</Text>
      <Text style={styles.counter}>{currentIndex + 1} / {exercises.length}</Text>
      <View style={styles.exerciseArea}>
        <Text style={styles.exerciseName}>{current.exercise.name}</Text>
        {current.exercise.description && <Text style={styles.exerciseDesc}>{current.exercise.description}</Text>}
        {current.exercise.duration ? (
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        ) : current.exercise.sets && current.exercise.reps ? (
          <Text style={styles.timer}>{current.exercise.sets} x {current.exercise.reps}</Text>
        ) : null}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={handleQuit}><Text style={styles.controlBtnText}>✕ Quit</Text></TouchableOpacity>
        {current.exercise.duration ? (
          <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={handlePause}>
            <Text style={styles.controlBtnText}>{isPaused ? '▶ Resume' : '⏸ Pause'}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.controlBtn, styles.nextBtn]} onPress={handleSkip}>
          <Text style={[styles.controlBtnText, { color: '#fff' }]}>{currentIndex >= exercises.length - 1 ? '✓ Finish' : '→ Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  loadingText: { color: '#fff', fontSize: 18 },
  progressBar: { height: 4, backgroundColor: '#333', marginHorizontal: 20 },
  progressFill: { height: 4, backgroundColor: '#4CAF50' },
  phaseLabel: { color: '#4CAF50', fontSize: 14, textAlign: 'center', marginTop: 16 },
  counter: { color: '#666', fontSize: 13, textAlign: 'center', marginTop: 4 },
  exerciseArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  exerciseName: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  exerciseDesc: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 12 },
  timer: { color: '#4CAF50', fontSize: 64, fontWeight: 'bold', marginTop: 40 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, paddingBottom: 40 },
  controlBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#333' },
  pauseBtn: { backgroundColor: '#555' },
  nextBtn: { backgroundColor: '#4CAF50' },
  controlBtnText: { fontSize: 16, fontWeight: '600', color: '#ccc' },
  finishContainer: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', padding: 24 },
  finishIcon: { fontSize: 64 },
  finishTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 16 },
  finishSubtitle: { color: '#aaa', fontSize: 16, marginTop: 8 },
  finishStats: { flexDirection: 'row', marginTop: 40, gap: 32 },
  finishStatItem: { alignItems: 'center' },
  finishStatValue: { color: '#4CAF50', fontSize: 24, fontWeight: 'bold' },
  finishStatLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  doneButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, paddingHorizontal: 60, marginTop: 40 },
  doneButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
