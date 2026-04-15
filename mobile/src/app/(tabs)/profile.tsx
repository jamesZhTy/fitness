import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores/auth.store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{user?.username?.charAt(0)?.toUpperCase() || '?'}</Text>
      </View>
      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.height || '--'}</Text>
          <Text style={styles.statLabel}>Height (cm)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.weight || '--'}</Text>
          <Text style={styles.statLabel}>Weight (kg)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.fitnessLevel || '--'}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40, backgroundColor: '#f5f5f5' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  username: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#999', marginTop: 4 },
  bio: { fontSize: 14, color: '#666', marginTop: 12, paddingHorizontal: 40, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 30, gap: 30 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  logoutButton: { marginTop: 40, backgroundColor: '#ff5252', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
