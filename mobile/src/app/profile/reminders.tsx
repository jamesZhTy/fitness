import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, TextInput, StyleSheet, Alert, FlatList } from 'react-native';
import { reminderService } from '../../services/reminder.service';
import { Reminder } from '../../types/checkin';

const ALL_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['周一', '周三', '周五']);
  const [loading, setLoading] = useState(true);

  const loadReminders = async () => {
    try { const data = await reminderService.getAll(); setReminders(data); } catch {}
    setLoading(false);
  };

  useEffect(() => { loadReminders(); }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleAdd = async () => {
    if (!time || selectedDays.length === 0) { Alert.alert('错误', '请设置时间并选择至少一天'); return; }
    try {
      await reminderService.create({ time, repeatDays: selectedDays });
      setShowForm(false);
      setTime('08:00');
      setSelectedDays(['周一', '周三', '周五']);
      loadReminders();
    } catch (err: any) {
      Alert.alert('错误', err.response?.data?.message || '创建提醒失败');
    }
  };

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await reminderService.update(id, { isEnabled: !isEnabled });
      loadReminders();
    } catch {}
  };

  const handleDelete = (id: string) => {
    Alert.alert('删除提醒', '确定要删除吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        try { await reminderService.delete(id); loadReminders(); } catch {}
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>暂未设置提醒</Text> : null}
        renderItem={({ item }) => (
          <Pressable style={({pressed}) => [styles.card, pressed && {opacity: 0.7}]} onLongPress={() => handleDelete(item.id)}>
            <View style={styles.cardLeft}>
              <Text style={styles.timeText}>{item.time.substring(0, 5)}</Text>
              <Text style={styles.daysText}>{item.repeatDays.join(', ')}</Text>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
            <Switch value={item.isEnabled} onValueChange={() => handleToggle(item.id, item.isEnabled)}
              trackColor={{ false: '#3D3D5C', true: '#FF6B6B' }} />
          </Pressable>
        )}
      />

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>时间</Text>
          <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor="#6B6B80" />
          <Text style={styles.formLabel}>重复日期</Text>
          <View style={styles.daysRow}>
            {ALL_DAYS.map((d) => (
              <Pressable key={d} style={({pressed}) => [styles.dayChip, selectedDays.includes(d) && styles.dayChipActive, pressed && {opacity: 0.7}]}
                onPress={() => toggleDay(d)}>
                <Text style={[styles.dayChipText, selectedDays.includes(d) && styles.dayChipTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={({pressed}) => [styles.saveBtn, pressed && {opacity: 0.7}]} onPress={handleAdd}><Text style={styles.saveBtnText}>保存</Text></Pressable>
        </View>
      )}

      <Pressable style={({pressed}) => [styles.addBtn, pressed && {opacity: 0.7}]} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? '取消' : '+ 添加提醒'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#6B6B80', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#3D3D5C', elevation: 2 },
  cardLeft: { flex: 1 },
  timeText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  daysText: { fontSize: 13, color: '#FF8E53', marginTop: 4 },
  messageText: { fontSize: 12, color: '#6B6B80', marginTop: 2 },
  form: { backgroundColor: '#2D2D44', margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#3D3D5C', elevation: 3 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#A0A0B0', marginTop: 8, marginBottom: 8 },
  input: { backgroundColor: '#1A1A2E', borderRadius: 10, padding: 12, fontSize: 18, textAlign: 'center', color: '#FFFFFF', borderWidth: 1, borderColor: '#3D3D5C' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#363654' },
  dayChipActive: { backgroundColor: '#FF6B6B' },
  dayChipText: { fontSize: 13, color: '#6B6B80' },
  dayChipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  addBtn: { backgroundColor: '#FF6B6B', margin: 16, borderRadius: 12, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
