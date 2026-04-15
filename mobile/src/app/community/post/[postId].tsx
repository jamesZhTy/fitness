import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, Pressable,
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
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#A0A0B0' }}>动态不存在</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>动态</Text>
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
              <Pressable onPress={handleLike} style={({pressed}) => pressed && {opacity: 0.7}}>
                <Text style={styles.actionText}>❤️ {post.likesCount}</Text>
              </Pressable>
              <Text style={styles.actionText}>💬 {post.commentsCount}</Text>
            </View>
            <Text style={styles.sectionTitle}>评论</Text>
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
          <Text style={styles.emptyText}>暂无评论</Text>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="写评论..."
          placeholderTextColor="#6B6B80"
          value={commentText}
          onChangeText={setCommentText}
        />
        <Pressable onPress={handleSendComment} disabled={sending} style={({pressed}) => pressed && {opacity: 0.7}}>
          <Text style={[styles.sendBtn, sending && { opacity: 0.5 }]}>发送</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  postSection: { backgroundColor: '#2D2D44', padding: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B6B',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  username: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  content: { fontSize: 16, lineHeight: 24, marginBottom: 16, color: '#A0A0B0' },
  actions: {
    flexDirection: 'row', gap: 24, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#3D3D5C',
  },
  actionText: { fontSize: 14, color: '#A0A0B0' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, color: '#FFFFFF' },
  commentItem: {
    flexDirection: 'row', padding: 16, backgroundColor: '#2D2D44',
    borderBottomWidth: 1, borderBottomColor: '#3D3D5C',
  },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF8E53',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  commentAvatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  commentUser: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#FFFFFF' },
  commentContent: { fontSize: 14, lineHeight: 20, color: '#A0A0B0' },
  emptyText: { textAlign: 'center', color: '#6B6B80', padding: 24 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#2D2D44',
    borderTopWidth: 1, borderTopColor: '#3D3D5C',
  },
  commentInput: {
    flex: 1, backgroundColor: '#1A1A2E', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, marginRight: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#3D3D5C',
  },
  sendBtn: { color: '#FF6B6B', fontWeight: '600', fontSize: 16 },
});
