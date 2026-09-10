import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface FeedPost {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  type: 'PROMO' | 'UPDATE' | 'GALLERY' | 'REVIEW';
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isFollowing: boolean;
}

export default function SocialFeedPage() {
  const [postText, setPostText] = useState('');
  const qc = useQueryClient();

  const { data: feedRes, isLoading } = useQuery({
    queryKey: ['social-feed'],
    queryFn: () => api.get('/social/feed'),
  });

  const { data: trendingRes } = useQuery({
    queryKey: ['trending-providers'],
    queryFn: () => api.get('/social/trending'),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.post(`/social/feed/${postId}/like`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-feed'] }),
  });

  const followMutation = useMutation({
    mutationFn: (providerId: string) => api.post(`/social/follow/${providerId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-feed'] }),
  });

  const posts: FeedPost[] = (feedRes as any)?.data ?? [];

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; body: string; type: string }) =>
      api.post('/social/feed', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-feed'] });
      setPostText('');
    },
  });

  const trending = (trendingRes as any)?.data ?? [];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PROMO': return 'bg-red-100 text-red-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'GALLERY': return 'bg-purple-100 text-purple-700';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>

          {/* Create Post */}
          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                U
              </div>
              <div className="flex-1">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Bagikan pengalaman Anda..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 h-20 resize-none focus:border-primary-500 focus:outline-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-primary-600">📷 Foto</button>
                    <button className="text-gray-400 hover:text-primary-600">📍 Lokasi</button>
                  </div>
                  <button
                    onClick={() => createPostMutation.mutate({ title: postText.slice(0, 50), body: postText, type: 'REVIEW' })}
                    className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50" disabled={!postText.trim() || createPostMutation.isPending}>
                    {createPostMutation.isPending ? 'Posting...' : 'Posting'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Posts */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">Belum ada postingan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.providerName)}&background=6C63FF&color=fff`}
                          alt={post.providerName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{post.providerName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(post.type)}`}>
                          {post.type}
                        </span>
                        <button
                          onClick={() => followMutation.mutate(post.providerId)}
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            post.isFollowing
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                          }`}
                        >
                          {post.isFollowing ? 'Mengikuti' : 'Ikuti'}
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-3">{post.title}</h3>
                    <p className="text-gray-600 mt-1">{post.body}</p>
                  </div>

                  {post.imageUrl && (
                    <div className="border-t border-gray-100">
                      <img src={post.imageUrl} alt="" className="w-full h-64 object-cover" />
                    </div>
                  )}

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-6">
                      <button
                        onClick={() => likeMutation.mutate(post.id)}
                        className={`flex items-center gap-2 text-sm ${
                          post.isLiked ? 'text-red-500 font-semibold' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        ❤️ {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600">
                        💬 {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600">
                        🔗 Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending Providers */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">🔥 Trending</h3>
            <div className="space-y-3">
              {trending.map((t: any, i: number) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.followers} followers</p>
                  </div>
                  <span className="text-xs text-primary-600 font-medium">{t.bookingCount} booking</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Providers */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Disarankan</h3>
            <div className="space-y-3">
              {[
                { name: 'Nail Art Studio', category: 'Kecantikan', rating: 4.8 },
                { name: 'Hair Colorist Pro', category: 'Salon', rating: 4.7 },
                { name: 'Massage & Spa', category: 'Spa', rating: 4.9 },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category} ★ {p.rating}</p>
                  </div>
                  <button className="text-xs text-primary-600 font-medium hover:underline">Ikuti</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
