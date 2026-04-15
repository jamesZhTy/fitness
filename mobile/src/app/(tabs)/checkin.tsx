import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { checkinService } from '../../services/checkin.service';
import { CheckIn, CheckInStats } from '../../types/checkin';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CheckInScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ciData, statsData] = await Promise.all([
        checkinService.getByMonth(year, month),
        checkinService.getStats(period),
      ]);
      setCheckIns(ciData);
      setStats(statsData);
    } catch {}
    setLoading(false);
  }, [year, month, period]);

  useEffect(() => { loadData(); }, [loadData]);

  const checkedDays = new Set(checkIns.map((ci) => parseInt(ci.date.split('-')[2], 10)));

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={prevMonth}><Text style={styles.arrow}>‹</Text></TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth}><Text style={styles.arrow}>›</Text></TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          {DAYS.map((d) => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
          {calendarCells.map((day, i) => (
            <View key={i} style={styles.dayCell}>
              {day && (
                <>
                  <Text style={[styles.dayText, checkedDays.has(day) && styles.checkedDayText]}>{day}</Text>
                  {checkedDays.has(day) && <View style={styles.checkDot} />}
                </>
              )}
            </View>
          ))}
        </View>

        {/* Streak */}
        {stats && stats.streak > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakText}>🔥 {stats.streak} day streak!</Text>
          </View>
        )}

        {/* Period Filter */}
        <View style={styles.periodRow}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <TouchableOpacity key={p} style={[styles.periodChip, period === p && styles.periodChipActive]}
              onPress={() => setPeriod(p)}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        {loading ? <ActivityIndicator color="#4CAF50" style={{ marginTop: 20 }} /> : stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCheckIns}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalDuration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCalories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/checkin/create')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  arrow: { fontSize: 28, color: '#4CAF50', paddingHorizontal: 16 },
  monthTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  dayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#999', marginBottom: 8, fontWeight: '600' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 8 },
  dayText: { fontSize: 14, color: '#333' },
  checkedDayText: { color: '#4CAF50', fontWeight: 'bold' },
  checkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginTop: 2 },
  streakBanner: { backgroundColor: '#FFF3E0', marginHorizontal: 16, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 },
  streakText: { fontSize: 16, fontWeight: '600', color: '#FF9800' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  periodChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
  periodChipActive: { backgroundColor: '#4CAF50' },
  periodText: { fontSize: 13, color: '#666' },
  periodTextActive: { color: '#fff' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
});
