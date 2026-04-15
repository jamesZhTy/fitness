import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable, Image,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Post } from '../../types/social';
import { postService } from '../../services/post.service';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

function PostCard({ post, onLike, onPress }: { post: Post; onLike: () => void; onPress: () => void }) {
  return (
    <Pressable style={({pressed}) => [styles.card, pressed && {opacity: 0.7}]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.user?.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{post.user?.username || '未知用户'}</Text>
          <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      {post.images && post.images.length > 0 && (
        <View style={styles.imagesRow}>
          {post.images.slice(0, 3).map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.postImage} />
          ))}
        </View>
      )}
      <View style={styles.actions}>
        <Pressable onPress={onLike} style={({pressed}) => [styles.actionBtn, pressed && {opacity: 0.7}]}>
          <Text style={styles.actionText}>❤️ {post.likesCount}</Text>
        </Pressable>
        <Pressable onPress={onPress} style={({pressed}) => [styles.actionBtn, pressed && {opacity: 0.7}]}>
          <Text style={styles.actionText}>💬 {post.commentsCount}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadFeed = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      const data = await postService.getFeed(pageNum);
      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setPage(pageNum);
    } catch (e) {
      console.error('加载动态失败', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleLike = async (postId: string) => {
    const result = await postService.toggleLike(postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likesCount: p.likesCount + (result.liked ? 1 : -1) }
          : p,
      ),
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>社区</Text>
        <Pressable
          style={({pressed}) => [styles.createBtn, pressed && {opacity: 0.7}]}
          onPress={() => router.push('/community/create-post')}
        >
          <Text style={styles.createBtnText}>+ 发帖</Text>
        </Pressable>
      </View>
      <View style={styles.navRow}>
        <Pressable style={({pressed}) => [styles.navBtn, pressed && {opacity: 0.7}]} onPress={() => router.push('/community/teams')}>
          <Text style={styles.navBtnText}>团队</Text>
        </Pressable>
        <Pressable style={({pressed}) => [styles.navBtn, pressed && {opacity: 0.7}]} onPress={() => router.push('/community/challenges')}>
          <Text style={styles.navBtnText}>挑战</Text>
        </Pressable>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onPress={() => router.push(`/community/post/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadFeed(1, true)} />
        }
        onEndReached={() => loadFeed(page + 1)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>暂无动态</Text>
            <Text style={styles.emptySubtext}>关注好友或发布你的第一条动态吧！</Text>
          </View>
        }
        contentContainerStyle={posts.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#2D2D44',
    borderBottomWidth: 1, borderBottomColor: '#3D3D5C',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  createBtn: {
    backgroundColor: '#FF6B6B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  createBtnText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#2D2D44', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#3D3D5C',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B6B',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  username: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  time: { fontSize: 12, color: '#6B6B80' },
  content: { fontSize: 15, lineHeight: 22, marginBottom: 12, color: '#A0A0B0' },
  imagesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  postImage: { width: 100, height: 100, borderRadius: 8 },
  actions: {
    flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#3D3D5C', paddingTop: 12,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 14, color: '#A0A0B0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B6B80' },
  emptySubtext: { fontSize: 14, color: '#6B6B80', marginTop: 8 },
  navRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#2D2D44',
  },
  navBtn: {
    flex: 1, backgroundColor: 'rgba(255,107,107,0.15)', paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  navBtnText: { color: '#FF6B6B', fontWeight: '600', fontSize: 15 },
});
