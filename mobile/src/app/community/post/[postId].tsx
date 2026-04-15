import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Post, Comment } from '../../../types/social';
import { postService } from '../../../services/post.service';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, c] = await Promise.all([
          postService.getPostById(postId!),
          postService.getComments(postId!),
        ]);
        setPost(p);
        setComments(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    const result = await postService.toggleLike(post.id);
    setPost({
      ...post,
      likesCount: post.likesCount + (result.liked ? 1 : -1),
    });
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !post) return;
    setSending(true);
    try {
      const comment = await postService.createComment(post.id, commentText.trim());
      setComments((prev) => [...prev, comment]);
      setPost({ ...post, commentsCount: post.commentsCount + 1 });
      setCommentText('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.postSection}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.user?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.username}>{post.user?.username}</Text>
            </View>
            <Text style={styles.content}>{post.content}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleLike}>
                <Text style={styles.actionText}>❤️ {post.likesCount}</Text>
              </TouchableOpacity>
              <Text style={styles.actionText}>💬 {post.commentsCount}</Text>
            </View>
            <Text style={styles.sectionTitle}>Comments</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {item.user?.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.commentUser}>{item.user?.username}</Text>
              <Text style={styles.commentContent}>{item.content}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet</Text>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={handleSendComment} disabled={sending}>
          <Text style={[styles.sendBtn, sending && { opacity: 0.5 }]}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontWeight: '600' },
  postSection: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  username: { fontSize: 16, fontWeight: '600' },
  content: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  actions: {
    flexDirection: 'row', gap: 24, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  actionText: { fontSize: 14, color: '#666' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  commentItem: {
    flexDirection: 'row', padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#81C784',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  commentAvatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  commentUser: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  commentContent: { fontSize: 14, lineHeight: 20, color: '#333' },
  emptyText: { textAlign: 'center', color: '#999', padding: 24 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  commentInput: {
    flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, marginRight: 12,
  },
  sendBtn: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
});
