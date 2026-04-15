import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { checkinService } from '../../services/checkin.service';
import { CheckIn, CheckInStats } from '../../types/checkin';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

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
          <Pressable onPress={prevMonth} style={({pressed}) => pressed && {opacity: 0.7}}><Text style={styles.arrow}>‹</Text></Pressable>
          <Text style={styles.monthTitle}>{MONTHS[month - 1]} {year}</Text>
          <Pressable onPress={nextMonth} style={({pressed}) => pressed && {opacity: 0.7}}><Text style={styles.arrow}>›</Text></Pressable>
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
            <Text style={styles.streakText}>🔥 已连续打卡 {stats.streak} 天！</Text>
          </View>
        )}

        {/* Period Filter */}
        <View style={styles.periodRow}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <Pressable key={p} style={({pressed}) => [styles.periodChip, period === p && styles.periodChipActive, pressed && {opacity: 0.7}]}
              onPress={() => setPeriod(p)}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats */}
        {loading ? <ActivityIndicator color="#FF6B6B" style={{ marginTop: 20 }} /> : stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCheckIns}</Text>
              <Text style={styles.statLabel}>打卡次数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalDuration}</Text>
              <Text style={styles.statLabel}>分钟</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCalories}</Text>
              <Text style={styles.statLabel}>卡路里</Text>
            </View>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={({pressed}) => [styles.fab, pressed && {opacity: 0.7}]} onPress={() => router.push('/checkin/create')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  arrow: { fontSize: 28, color: '#FF6B6B', paddingHorizontal: 16 },
  monthTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  dayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#6B6B80', marginBottom: 8, fontWeight: '600' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 8 },
  dayText: { fontSize: 14, color: '#A0A0B0' },
  checkedDayText: { color: '#00E676', fontWeight: 'bold' },
  checkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E676', marginTop: 2 },
  streakBanner: { backgroundColor: 'rgba(255,107,107,0.15)', marginHorizontal: 16, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 },
  streakText: { fontSize: 16, fontWeight: '600', color: '#FF8E53' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  periodChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2D2D44' },
  periodChipActive: { backgroundColor: '#FF6B6B' },
  periodText: { fontSize: 13, color: '#6B6B80' },
  periodTextActive: { color: '#fff' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FF6B6B' },
  statLabel: { fontSize: 12, color: '#6B6B80', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
});
