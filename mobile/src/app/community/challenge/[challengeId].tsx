import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Challenge, ChallengeParticipant } from '../../../types/team';
import { challengeService } from '../../../services/challenge.service';
import { useAuthStore } from '../../../stores/auth.store';

export default function ChallengeDetailScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, lb] = await Promise.all([
          challengeService.getChallengeById(challengeId!),
          challengeService.getLeaderboard(challengeId!),
        ]);
        setChallenge(c);
        setLeaderboard(lb);
        setJoined(lb.some((p) => p.userId === currentUser?.id));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [challengeId]);

  const handleJoin = async () => {
    try {
      await challengeService.joinChallenge(challengeId!);
      setJoined(true);
      setChallenge((prev) => prev ? { ...prev, participantCount: prev.participantCount + 1 } : prev);
      const lb = await challengeService.getLeaderboard(challengeId!);
      setLeaderboard(lb);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to join');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  if (!challenge) return <View style={styles.center}><Text>Challenge not found</Text></View>;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        {challenge.description && <Text style={styles.desc}>{challenge.description}</Text>}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{challenge.goal}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{challenge.participantCount}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
        <Text style={styles.dates}>{challenge.startDate} ~ {challenge.endDate}</Text>
        {!joined && challenge.status !== 'completed' && (
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
            <Text style={styles.joinBtnText}>Join Challenge</Text>
          </TouchableOpacity>
        )}
        {joined && <Text style={styles.joinedText}>Joined</Text>}
      </View>
      <Text style={styles.sectionTitle}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.rankItem}>
            <Text style={styles.rank}>{medals[index] || `#${index + 1}`}</Text>
            <View style={styles.rankAvatar}>
              <Text style={styles.rankAvatarText}>{item.user?.username?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <Text style={styles.rankName}>{item.user?.username}</Text>
            <Text style={styles.rankScore}>{item.progress}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No participants yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 60, backgroundColor: '#fff' },
  backText: { fontSize: 16, color: '#4CAF50' },
  info: { backgroundColor: '#fff', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  challengeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 15, color: '#666', marginBottom: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 40, marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#999' },
  dates: { fontSize: 13, color: '#999', marginBottom: 16 },
  joinBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20 },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  joinedText: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8 },
  rankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rank: { fontSize: 20, width: 40, textAlign: 'center' },
  rankAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankAvatarText: { color: '#fff', fontWeight: 'bold' },
  rankName: { fontSize: 16, flex: 1 },
  rankScore: { fontSize: 18, fontWeight: '700', color: '#4CAF50' },
  empty: { textAlign: 'center', color: '#999', padding: 32 },
});
