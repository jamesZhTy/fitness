import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }
    if (password.length < 6) {
      Alert.alert('错误', '密码至少需要6个字符');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, username);
    } catch (err: any) {
      Alert.alert('注册失败', err.response?.data?.message || '请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>创建账号</Text>
      <Text style={styles.subtitle}>加入燃动健身社区</Text>

      <TextInput style={styles.input} placeholder="邮箱" placeholderTextColor="#6B6B80" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="用户名" placeholderTextColor="#6B6B80" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="密码（至少6个字符）" placeholderTextColor="#6B6B80" value={password} onChangeText={setPassword} secureTextEntry />

      <Pressable style={({pressed}) => [styles.button, pressed && {opacity: 0.7}]} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>注册</Text>}
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>已有账号？立即登录</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#1A1A2E' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#FF6B6B', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#A0A0B0', marginBottom: 40 },
  input: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#3D3D5C', color: '#FFFFFF' },
  button: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#FF6B6B', fontSize: 14 },
});
