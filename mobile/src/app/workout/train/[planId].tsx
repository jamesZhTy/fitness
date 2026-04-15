import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
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
    Alert.alert('退出训练', '确定要退出训练吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => { if (timerRef.current) clearInterval(timerRef.current); router.back(); } },
    ]);
  };

  if (!plan || exercises.length === 0) {
    return <View style={styles.center}><Text style={styles.loadingText}>加载中...</Text></View>;
  }

  if (isFinished) {
    return (
      <View style={styles.finishContainer}>
        <Text style={styles.finishIcon}>🎉</Text>
        <Text style={styles.finishTitle}>太棒了！</Text>
        <Text style={styles.finishSubtitle}>{plan.title} 已完成</Text>
        <View style={styles.finishStats}>
          <View style={styles.finishStatItem}><Text style={styles.finishStatValue}>{formatTime(totalElapsed)}</Text><Text style={styles.finishStatLabel}>时长</Text></View>
          <View style={styles.finishStatItem}><Text style={styles.finishStatValue}>{plan.caloriesBurned}</Text><Text style={styles.finishStatLabel}>千卡</Text></View>
          <View style={styles.finishStatItem}><Text style={styles.finishStatValue}>{exercises.length}</Text><Text style={styles.finishStatLabel}>动作数</Text></View>
        </View>
        <Pressable style={({pressed}) => [styles.doneButton, pressed && {opacity: 0.7}]} onPress={() => router.back()}><Text style={styles.doneButtonText}>完成</Text></Pressable>
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
        <Pressable style={({pressed}) => [styles.controlBtn, pressed && {opacity: 0.7}]} onPress={handleQuit}><Text style={styles.controlBtnText}>✕ 退出</Text></Pressable>
        {current.exercise.duration ? (
          <Pressable style={({pressed}) => [styles.controlBtn, styles.pauseBtn, pressed && {opacity: 0.7}]} onPress={handlePause}>
            <Text style={styles.controlBtnText}>{isPaused ? '▶ 继续' : '⏸ 暂停'}</Text>
          </Pressable>
        ) : null}
        <Pressable style={({pressed}) => [styles.controlBtn, styles.nextBtn, pressed && {opacity: 0.7}]} onPress={handleSkip}>
          <Text style={[styles.controlBtnText, { color: '#fff' }]}>{currentIndex >= exercises.length - 1 ? '✓ 完成' : '→ 下一个'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E', paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  loadingText: { color: '#fff', fontSize: 18 },
  progressBar: { height: 4, backgroundColor: '#2D2D44', marginHorizontal: 20 },
  progressFill: { height: 4, backgroundColor: '#FF6B6B' },
  phaseLabel: { color: '#FF8E53', fontSize: 14, textAlign: 'center', marginTop: 16 },
  counter: { color: '#6B6B80', fontSize: 13, textAlign: 'center', marginTop: 4 },
  exerciseArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  exerciseName: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  exerciseDesc: { color: '#A0A0B0', fontSize: 16, textAlign: 'center', marginTop: 12 },
  timer: { color: '#FF6B6B', fontSize: 64, fontWeight: 'bold', marginTop: 40 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, paddingBottom: 40 },
  controlBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#2D2D44' },
  pauseBtn: { backgroundColor: '#363654' },
  nextBtn: { backgroundColor: '#FF6B6B' },
  controlBtnText: { fontSize: 16, fontWeight: '600', color: '#A0A0B0' },
  finishContainer: { flex: 1, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', padding: 24 },
  finishIcon: { fontSize: 64 },
  finishTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 16 },
  finishSubtitle: { color: '#A0A0B0', fontSize: 16, marginTop: 8 },
  finishStats: { flexDirection: 'row', marginTop: 40, gap: 32 },
  finishStatItem: { alignItems: 'center' },
  finishStatValue: { color: '#FF6B6B', fontSize: 24, fontWeight: 'bold' },
  finishStatLabel: { color: '#6B6B80', fontSize: 12, marginTop: 4 },
  doneButton: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 16, paddingHorizontal: 60, marginTop: 40 },
  doneButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
