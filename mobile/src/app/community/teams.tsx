import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, TextInput,
  Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Team } from '../../types/team';
import { teamService } from '../../services/team.service';

export default function TeamsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    teamService.getTeams().then(setTeams).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const team = await teamService.createTeam({ name: newName.trim() });
      setTeams((prev) => [team, ...prev]);
      setShowCreate(false);
      setNewName('');
    } catch (e) {
      Alert.alert('错误', '创建团队失败');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.title}>团队</Text>
        <Pressable onPress={() => setShowCreate(true)} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.createText}>+ 新建</Text>
        </Pressable>
      </View>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({pressed}) => [styles.card, pressed && {opacity: 0.7}]}
            onPress={() => router.push(`/community/team/${item.id}`)}
          >
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.meta}>{item.memberCount}/{item.maxMembers} 成员</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>暂无团队，创建一个吧！</Text>}
      />
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>创建团队</Text>
            <TextInput
              style={styles.input}
              placeholder="团队名称"
              placeholderTextColor="#6B6B80"
              value={newName}
              onChangeText={setNewName}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowCreate(false)} style={({pressed}) => pressed && {opacity: 0.7}}>
                <Text style={styles.cancelBtn}>取消</Text>
              </Pressable>
              <Pressable onPress={handleCreate} style={({pressed}) => pressed && {opacity: 0.7}}>
                <Text style={styles.submitBtn}>创建</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#2D2D44',
    borderBottomWidth: 1, borderBottomColor: '#3D3D5C',
  },
  backText: { fontSize: 16, color: '#FF6B6B' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  createText: { fontSize: 16, color: '#FF6B6B', fontWeight: '600' },
  card: {
    backgroundColor: '#2D2D44', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#3D3D5C',
  },
  teamName: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  meta: { fontSize: 14, color: '#6B6B80', marginTop: 4 },
  empty: { textAlign: 'center', color: '#6B6B80', padding: 32 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
  },
  modal: { backgroundColor: '#2D2D44', borderRadius: 16, padding: 24, width: '80%', borderWidth: 1, borderColor: '#3D3D5C' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#FFFFFF' },
  input: {
    borderWidth: 1, borderColor: '#3D3D5C', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#1A1A2E', color: '#FFFFFF',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelBtn: { fontSize: 16, color: '#6B6B80' },
  submitBtn: { fontSize: 16, color: '#FF6B6B', fontWeight: '600' },
});
