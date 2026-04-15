import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
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
      Alert.alert('Error', e.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    try {
      await teamService.leaveTeam(teamId!);
      setIsMember(false);
      setTeam((prev) => prev ? { ...prev, memberCount: prev.memberCount - 1 } : prev);
      setMembers((prev) => prev.filter((m) => m.userId !== currentUser?.id));
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to leave');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  if (!team) return <View style={styles.center}><Text>Team not found</Text></View>;

  const isCaptain = currentUser?.id === team.captainId;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.teamName}>{team.name}</Text>
        {team.description && <Text style={styles.desc}>{team.description}</Text>}
        <Text style={styles.meta}>{team.memberCount}/{team.maxMembers} members</Text>
        {!isMember && (
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
            <Text style={styles.joinBtnText}>Join Team</Text>
          </TouchableOpacity>
        )}
        {isMember && !isCaptain && (
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
            <Text style={styles.leaveBtnText}>Leave Team</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.sectionTitle}>Members</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.user?.username?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <Text style={styles.memberName}>{item.user?.username}</Text>
            {item.userId === team.captainId && <Text style={styles.captainBadge}>Captain</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#fff' },
  backText: { fontSize: 16, color: '#4CAF50' },
  info: { backgroundColor: '#fff', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  teamName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 15, color: '#666', marginBottom: 8, textAlign: 'center' },
  meta: { fontSize: 14, color: '#999', marginBottom: 16 },
  joinBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20 },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  leaveBtn: { backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#F44336' },
  leaveBtnText: { color: '#F44336', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8 },
  memberItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  memberName: { fontSize: 16, flex: 1 },
  captainBadge: { fontSize: 12, color: '#FF9800', fontWeight: '600' },
});
