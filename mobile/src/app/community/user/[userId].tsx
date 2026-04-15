import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Post, FollowCounts } from '../../../types/social';
import { postService } from '../../../services/post.service';
import { useAuthStore } from '../../../stores/auth.store';

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMe = currentUser?.id === userId;

  useEffect(() => {
    const load = async () => {
      try {
        const [userPosts, followCounts] = await Promise.all([
          postService.getUserPosts(userId!),
          postService.getFollowCounts(userId!),
        ]);
        setPosts(userPosts);
        setCounts(followCounts);

        if (!isMe) {
          const followers = await postService.getFollowers(userId!);
          setIsFollowing(
            followers.some((f: any) => f.followerId === currentUser?.id),
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleFollow = async () => {
    const result = await postService.toggleFollow(userId!);
    setIsFollowing(result.following);
    setCounts((prev) => ({
      ...prev,
      followers: prev.followers + (result.following ? 1 : -1),
    }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {posts[0]?.user?.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.username}>{posts[0]?.user?.username || 'User'}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {!isMe && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollow}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => router.push(`/community/post/${item.id}`)}
          >
            <Text style={styles.postContent} numberOfLines={3}>
              {item.content}
            </Text>
            <View style={styles.postMeta}>
              <Text style={styles.metaText}>❤️ {item.likesCount}</Text>
              <Text style={styles.metaText}>💬 {item.commentsCount}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#fff' },
  backText: { fontSize: 16, color: '#4CAF50' },
  profileSection: {
    backgroundColor: '#fff', alignItems: 'center', paddingVertical: 24,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  username: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 40, marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#999' },
  followBtn: {
    backgroundColor: '#4CAF50', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20,
  },
  followingBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#4CAF50' },
  followBtnText: { color: '#fff', fontWeight: '600' },
  followingBtnText: { color: '#4CAF50' },
  postCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16,
  },
  postContent: { fontSize: 15, lineHeight: 22 },
  postMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaText: { fontSize: 13, color: '#999' },
  emptyText: { textAlign: 'center', color: '#999', padding: 32 },
});
