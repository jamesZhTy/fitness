import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
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
      Alert.alert('Hint', 'Please enter some content');
      return;
    }
    setSubmitting(true);
    try {
      await postService.createPost({ content: content.trim() });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to create post');
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          <Text style={[styles.postText, submitting && { opacity: 0.5 }]}>
            {submitting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Share your fitness journey..."
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '600' },
  cancelText: { fontSize: 16, color: '#999' },
  postText: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  input: {
    flex: 1, padding: 16, fontSize: 16, lineHeight: 24, textAlignVertical: 'top',
  },
  charCount: { padding: 16, color: '#999', textAlign: 'right' },
});
