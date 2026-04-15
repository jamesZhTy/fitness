import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Challenge } from '../../types/team';
import { challengeService } from '../../services/challenge.service';

const typeLabels: Record<string, string> = {
  consecutive_checkin: '连续打卡',
  total_duration: '累计时长',
  team_pk: '团队PK',
};

const statusColors: Record<string, string> = {
  upcoming: '#4FACFE',
  active: '#00E676',
  completed: '#6B6B80',
};

const statusLabels: Record<string, string> = {
  upcoming: '即将开始',
  active: '进行中',
  completed: '已结束',
};

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    challengeService.getChallenges().then(setChallenges).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.title}>挑战</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={({pressed}) => [styles.card, pressed && {opacity: 0.7}]} onPress={() => router.push(`/community/challenge/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Text style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>{statusLabels[item.status] || item.status}</Text>
            </View>
            <Text style={styles.typeText}>{typeLabels[item.type] || item.type}</Text>
            <Text style={styles.meta}>目标: {item.goal} | {item.participantCount} 人参与</Text>
            <Text style={styles.dates}>{item.startDate} ~ {item.endDate}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>暂无挑战</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#2D2D44', borderBottomWidth: 1, borderBottomColor: '#3D3D5C',
  },
  backText: { fontSize: 16, color: '#FF6B6B' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  card: { backgroundColor: '#2D2D44', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#3D3D5C' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeTitle: { fontSize: 18, fontWeight: '600', flex: 1, color: '#FFFFFF' },
  statusBadge: { color: '#fff', fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  typeText: { fontSize: 14, color: '#FF8E53', marginTop: 8 },
  meta: { fontSize: 14, color: '#A0A0B0', marginTop: 4 },
  dates: { fontSize: 13, color: '#6B6B80', marginTop: 4 },
  empty: { textAlign: 'center', color: '#6B6B80', padding: 32 },
});
