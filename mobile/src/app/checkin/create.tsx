import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { checkinService } from '../../services/checkin.service';

const MOODS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😐', label: 'OK' },
  { emoji: '😓', label: 'Tired' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😴', label: 'Exhausted' },
];

export default function CreateCheckInScreen() {
  const router = useRouter();
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await checkinService.create({
        date: new Date().toISOString().split('T')[0],
        mood: mood || undefined,
        note: note || undefined,
        duration: duration ? parseInt(duration, 10) : 0,
        caloriesBurned: calories ? parseInt(calories, 10) : 0,
      } as any);
      Alert.alert('Success', 'Check-in recorded! 🎉', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Check-in</Text>

      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => (
          <TouchableOpacity key={m.label} style={[styles.moodBtn, mood === m.label && styles.moodBtnActive]}
            onPress={() => setMood(m.label)}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={[styles.moodLabel, mood === m.label && styles.moodLabelActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration}
        keyboardType="numeric" placeholder="e.g. 30" />

      <Text style={styles.label}>Calories burned</Text>
      <TextInput style={styles.input} value={calories} onChangeText={setCalories}
        keyboardType="numeric" placeholder="e.g. 200" />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} value={note} onChangeText={setNote}
        multiline numberOfLines={4} placeholder="How was your workout?" />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Saving...' : 'Check In ✓'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 16, marginBottom: 8 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: '#fff', width: '18%' },
  moodBtnActive: { backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: '#4CAF50' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, color: '#999', marginTop: 4 },
  moodLabelActive: { color: '#4CAF50', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
