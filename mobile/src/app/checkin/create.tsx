import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { checkinService } from '../../services/checkin.service';

const MOODS = [
  { emoji: '😊', label: '很好' },
  { emoji: '😐', label: '一般' },
  { emoji: '😓', label: '疲惫' },
  { emoji: '💪', label: '力量满满' },
  { emoji: '😴', label: '精疲力尽' },
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
      Alert.alert('成功', '打卡已记录！🎉', [{ text: '好的', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('错误', err.response?.data?.message || '打卡失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>每日打卡</Text>

      <Text style={styles.label}>今天感觉如何？</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => (
          <Pressable key={m.label} style={({pressed}) => [styles.moodBtn, mood === m.label && styles.moodBtnActive, pressed && {opacity: 0.7}]}
            onPress={() => setMood(m.label)}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={[styles.moodLabel, mood === m.label && styles.moodLabelActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>运动时长（分钟）</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration}
        keyboardType="numeric" placeholder="例如 30" placeholderTextColor="#6B6B80" />

      <Text style={styles.label}>消耗卡路里</Text>
      <TextInput style={styles.input} value={calories} onChangeText={setCalories}
        keyboardType="numeric" placeholder="例如 200" placeholderTextColor="#6B6B80" />

      <Text style={styles.label}>备注</Text>
      <TextInput style={[styles.input, styles.textArea]} value={note} onChangeText={setNote}
        multiline numberOfLines={4} placeholder="今天训练感觉怎么样？" placeholderTextColor="#6B6B80" />

      <Pressable style={({pressed}) => [styles.submitBtn, pressed && {opacity: 0.7}]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? '保存中...' : '打卡 ✓'}</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#A0A0B0', marginTop: 16, marginBottom: 8 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: '#2D2D44', width: '18%' },
  moodBtnActive: { backgroundColor: 'rgba(255,107,107,0.15)', borderWidth: 2, borderColor: '#FF6B6B' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, color: '#6B6B80', marginTop: 4 },
  moodLabelActive: { color: '#FF6B6B', fontWeight: '600' },
  input: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#3D3D5C', color: '#FFFFFF' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
