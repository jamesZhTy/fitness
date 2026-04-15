import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Challenge } from '../../types/team';
import { challengeService } from '../../services/challenge.service';

const typeLabels: Record<string, string> = {
  consecutive_checkin: 'Consecutive Check-in',
  total_duration: 'Total Duration',
  team_pk: 'Team PK',
};

const statusColors: Record<string, string> = {
  upcoming: '#2196F3',
  active: '#4CAF50',
  completed: '#999',
};

export default function ChallengesScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    challengeService.getChallenges().then(setChallenges).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Challenges</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/community/challenge/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Text style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>{item.status}</Text>
            </View>
            <Text style={styles.typeText}>{typeLabels[item.type] || item.type}</Text>
            <Text style={styles.meta}>Goal: {item.goal} | {item.participantCount} participants</Text>
            <Text style={styles.dates}>{item.startDate} ~ {item.endDate}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No challenges yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  backText: { fontSize: 16, color: '#4CAF50' },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  statusBadge: { color: '#fff', fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  typeText: { fontSize: 14, color: '#4CAF50', marginTop: 8 },
  meta: { fontSize: 14, color: '#666', marginTop: 4 },
  dates: { fontSize: 13, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', padding: 32 },
});
