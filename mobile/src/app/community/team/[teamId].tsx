import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Team, TeamMember } from '../../../types/team';
import { teamService } from '../../../services/team.service';
import { useAuthStore } from '../../../stores/auth.store';

export default function TeamDetailScreen() {
  const insets = useSafeAreaInsets();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, m] = await Promise.all([
          teamService.getTeamById(teamId!),
          teamService.getMembers(teamId!),
        ]);
        setTeam(t);
        setMembers(m);
        setIsMember(m.some((member) => member.userId === currentUser?.id));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [teamId]);

  const handleJoin = async () => {
    try {
      await teamService.joinTeam(teamId!);
      setIsMember(true);
      setTeam((prev) => prev ? { ...prev, memberCount: prev.memberCount + 1 } : prev);
      const m = await teamService.getMembers(teamId!);
      setMembers(m);
    } catch (e: any) {
      Alert.alert('错误', e.response?.data?.message || '加入失败');
    }
  };

  const handleLeave = async () => {
    try {
      await teamService.leaveTeam(teamId!);
      setIsMember(false);
      setTeam((prev) => prev ? { ...prev, memberCount: prev.memberCount - 1 } : prev);
      setMembers((prev) => prev.filter((m) => m.userId !== currentUser?.id));
    } catch (e: any) {
      Alert.alert('错误', e.response?.data?.message || '退出失败');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
  if (!team) return <View style={styles.center}><Text style={{ color: '#A0A0B0' }}>团队不存在</Text></View>;

  const isCaptain = currentUser?.id === team.captainId;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.teamName}>{team.name}</Text>
        {team.description && <Text style={styles.desc}>{team.description}</Text>}
        <Text style={styles.meta}>{team.memberCount}/{team.maxMembers} 成员</Text>
        {!isMember && (
          <Pressable style={({pressed}) => [styles.joinBtn, pressed && {opacity: 0.7}]} onPress={handleJoin}>
            <Text style={styles.joinBtnText}>加入团队</Text>
          </Pressable>
        )}
        {isMember && !isCaptain && (
          <Pressable style={({pressed}) => [styles.leaveBtn, pressed && {opacity: 0.7}]} onPress={handleLeave}>
            <Text style={styles.leaveBtnText}>退出团队</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.sectionTitle}>成员</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.user?.username?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <Text style={styles.memberName}>{item.user?.username}</Text>
            {item.userId === team.captainId && <Text style={styles.captainBadge}>队长</Text>}
          </View>
        )}
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
  teamName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#FFFFFF' },
  desc: { fontSize: 15, color: '#A0A0B0', marginBottom: 8, textAlign: 'center' },
  meta: { fontSize: 14, color: '#6B6B80', marginBottom: 16 },
  joinBtn: { backgroundColor: '#FF6B6B', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20 },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  leaveBtn: { backgroundColor: 'transparent', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#FF5252' },
  leaveBtnText: { color: '#FF5252', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8, color: '#FFFFFF' },
  memberItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D2D44', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3D3D5C' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  memberName: { fontSize: 16, flex: 1, color: '#FFFFFF' },
  captainBadge: { fontSize: 12, color: '#FF8E53', fontWeight: '600' },
});
