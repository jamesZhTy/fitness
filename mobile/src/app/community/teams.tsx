import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
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
      Alert.alert('Error', 'Failed to create team');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Teams</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={styles.createText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/community/team/${item.id}`)}
          >
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.meta}>{item.memberCount}/{item.maxMembers} members</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No teams yet. Create one!</Text>}
      />
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Team</Text>
            <TextInput
              style={styles.input}
              placeholder="Team name"
              value={newName}
              onChangeText={setNewName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}>
                <Text style={styles.submitBtn}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  backText: { fontSize: 16, color: '#4CAF50' },
  title: { fontSize: 20, fontWeight: 'bold' },
  createText: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16,
  },
  teamName: { fontSize: 18, fontWeight: '600' },
  meta: { fontSize: 14, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', padding: 32 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelBtn: { fontSize: 16, color: '#999' },
  submitBtn: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
});
