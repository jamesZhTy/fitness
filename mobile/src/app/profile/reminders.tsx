import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, StyleSheet, Alert, FlatList } from 'react-native';
import { reminderService } from '../../services/reminder.service';
import { Reminder } from '../../types/checkin';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
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
    if (!time || selectedDays.length === 0) { Alert.alert('Error', 'Set time and at least one day'); return; }
    try {
      await reminderService.create({ time, repeatDays: selectedDays });
      setShowForm(false);
      setTime('08:00');
      setSelectedDays(['Mon', 'Wed', 'Fri']);
      loadReminders();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create reminder');
    }
  };

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await reminderService.update(id, { isEnabled: !isEnabled });
      loadReminders();
    } catch {}
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
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
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No reminders set</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id)}>
            <View style={styles.cardLeft}>
              <Text style={styles.timeText}>{item.time.substring(0, 5)}</Text>
              <Text style={styles.daysText}>{item.repeatDays.join(', ')}</Text>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
            <Switch value={item.isEnabled} onValueChange={() => handleToggle(item.id, item.isEnabled)}
              trackColor={{ false: '#ccc', true: '#4CAF50' }} />
          </TouchableOpacity>
        )}
      />

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Time</Text>
          <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:MM" />
          <Text style={styles.formLabel}>Repeat Days</Text>
          <View style={styles.daysRow}>
            {ALL_DAYS.map((d) => (
              <TouchableOpacity key={d} style={[styles.dayChip, selectedDays.includes(d) && styles.dayChipActive]}
                onPress={() => toggleDay(d)}>
                <Text style={[styles.dayChipText, selectedDays.includes(d) && styles.dayChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add Reminder'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardLeft: { flex: 1 },
  timeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  daysText: { fontSize: 13, color: '#4CAF50', marginTop: 4 },
  messageText: { fontSize: 12, color: '#999', marginTop: 2 },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, elevation: 3 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 8, marginBottom: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 18, textAlign: 'center' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e0e0e0' },
  dayChipActive: { backgroundColor: '#4CAF50' },
  dayChipText: { fontSize: 13, color: '#666' },
  dayChipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  addBtn: { backgroundColor: '#4CAF50', margin: 16, borderRadius: 12, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
