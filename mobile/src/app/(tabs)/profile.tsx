import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: logout },
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
          <Text style={styles.statLabel}>身高 (cm)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.weight || '--'}</Text>
          <Text style={styles.statLabel}>体重 (kg)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.fitnessLevel || '--'}</Text>
          <Text style={styles.statLabel}>等级</Text>
        </View>
      </View>
      <Pressable style={({pressed}) => [styles.settingsButton, pressed && {opacity: 0.7}]} onPress={() => router.push('/profile/reminders')}>
        <Text style={styles.settingsText}>⏰ 提醒设置</Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.logoutButton, pressed && {opacity: 0.7}]} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40, backgroundColor: '#1A1A2E' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  username: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  email: { fontSize: 14, color: '#6B6B80', marginTop: 4 },
  bio: { fontSize: 14, color: '#A0A0B0', marginTop: 12, paddingHorizontal: 40, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 30, gap: 30 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#6B6B80', marginTop: 4 },
  settingsButton: { marginTop: 20, backgroundColor: '#2D2D44', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, borderWidth: 1, borderColor: '#3D3D5C', elevation: 2 },
  settingsText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  logoutButton: { marginTop: 20, backgroundColor: '#FF5252', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
