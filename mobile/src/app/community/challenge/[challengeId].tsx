import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Challenge, ChallengeParticipant } from '../../../types/team';
import { challengeService } from '../../../services/challenge.service';
import { useAuthStore } from '../../../stores/auth.store';

export default function ChallengeDetailScreen() {
  const insets = useSafeAreaInsets();
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
      Alert.alert('错误', e.response?.data?.message || '加入失败');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
  if (!challenge) return <View style={styles.center}><Text style={{ color: '#A0A0B0' }}>挑战不存在</Text></View>;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        {challenge.description && <Text style={styles.desc}>{challenge.description}</Text>}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{challenge.goal}</Text>
            <Text style={styles.statLabel}>目标</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{challenge.participantCount}</Text>
            <Text style={styles.statLabel}>已参加</Text>
          </View>
        </View>
        <Text style={styles.dates}>{challenge.startDate} ~ {challenge.endDate}</Text>
        {!joined && challenge.status !== 'completed' && (
          <Pressable style={({pressed}) => [styles.joinBtn, pressed && {opacity: 0.7}]} onPress={handleJoin}>
            <Text style={styles.joinBtnText}>参加挑战</Text>
          </Pressable>
        )}
        {joined && <Text style={styles.joinedText}>已参加</Text>}
      </View>
      <Text style={styles.sectionTitle}>排行榜</Text>
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
        ListEmptyComponent={<Text style={styles.empty}>暂无参与者</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  header: { padding: 16, backgroundColor: '#2D2D44' },
  backText: { fontSize: 16, color: '#FF6B6B' },
  info: { backgroundColor: '#2D2D44', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#3D3D5C' },
  challengeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#FFFFFF' },
  desc: { fontSize: 15, color: '#A0A0B0', marginBottom: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 40, marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: '#FF6B6B' },
  statLabel: { fontSize: 12, color: '#6B6B80' },
  dates: { fontSize: 13, color: '#6B6B80', marginBottom: 16 },
  joinBtn: { backgroundColor: '#FF6B6B', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20 },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  joinedText: { color: '#00E676', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8, color: '#FFFFFF' },
  rankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D2D44', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3D3D5C' },
  rank: { fontSize: 20, width: 40, textAlign: 'center' },
  rankAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankAvatarText: { color: '#fff', fontWeight: 'bold' },
  rankName: { fontSize: 16, flex: 1, color: '#FFFFFF' },
  rankScore: { fontSize: 18, fontWeight: '700', color: '#FF8E53' },
  empty: { textAlign: 'center', color: '#6B6B80', padding: 32 },
});
