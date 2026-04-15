import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { postService } from '../../services/post.service';

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入内容');
      return;
    }
    setSubmitting(true);
    try {
      await postService.createPost({ content: content.trim() });
      router.back();
    } catch (e) {
      Alert.alert('错误', '发帖失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.cancelText}>取消</Text>
        </Pressable>
        <Text style={styles.title}>发布动态</Text>
        <Pressable onPress={handleSubmit} disabled={submitting} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={[styles.postText, submitting && { opacity: 0.5 }]}>
            {submitting ? '发布中...' : '发布'}
          </Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.input}
        placeholder="分享你的健身日常..."
        placeholderTextColor="#6B6B80"
        multiline
        autoFocus
        value={content}
        onChangeText={setContent}
        maxLength={1000}
      />
      <Text style={styles.charCount}>{content.length}/1000</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#3D3D5C',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  cancelText: { fontSize: 16, color: '#6B6B80' },
  postText: { fontSize: 16, color: '#FF6B6B', fontWeight: '600' },
  input: {
    flex: 1, padding: 16, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', color: '#FFFFFF',
  },
  charCount: { padding: 16, color: '#6B6B80', textAlign: 'right' },
});
