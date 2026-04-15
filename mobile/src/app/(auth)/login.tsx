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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('登录失败', err.response?.data?.message || '请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>燃动健身</Text>
      <Text style={styles.subtitle}>开启你的健身之旅</Text>

      <TextInput
        style={styles.input}
        placeholder="邮箱"
        placeholderTextColor="#6B6B80"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        placeholderTextColor="#6B6B80"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={({pressed}) => [styles.button, pressed && {opacity: 0.7}]} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>登录</Text>
        )}
      </Pressable>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>还没有账号？立即注册</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#1A1A2E' },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#FF6B6B', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#A0A0B0', marginBottom: 40 },
  input: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#3D3D5C', color: '#FFFFFF' },
  button: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#FF6B6B', fontSize: 14 },
});
