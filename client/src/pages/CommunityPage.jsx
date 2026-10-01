import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import {
  Heart, MessageSquare, Plus,
  X, Sparkles
} from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Mindfulness & Study');
  const [activeTab, setActiveTab] = useState('All');

  // Comment Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [postComments, setPostComments] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/community/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to fetch community posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await API.post(`/community/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: res.data.likes_count } : p));
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    try {
      await API.post('/community/posts', {
        title: postTitle,
        content: postContent,
        category: postCategory
      });
      setPostTitle('');
      setPostContent('');
      setShowCreateModal(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const openComments = async (post) => {
    setSelectedPost(post);
    try {
      const res = await API.get(`/community/posts/${post.id}/comments`);
      setPostComments(res.data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPost) return;

    try {
      await API.post(`/community/posts/${selectedPost.id}/comments`, { content: commentInput });
      setCommentInput('');
      const res = await API.get(`/community/posts/${selectedPost.id}/comments`);
      setPostComments(res.data.comments || []);
      fetchPosts();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const filteredPosts = activeTab === 'All'
    ? posts
    : posts.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-gray-900 selection:bg-primary-container selection:text-white pb-20">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stitch Community Header */}
        <section className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ABES Student Community
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">Growing together in shared academic wisdom, coding projects, and peer support.</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white font-label font-extrabold rounded-lg shadow-sm text-xs flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Create Discussion Post</span>
          </button>
        </section>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Daily Prompt', 'Milestones', 'Study Tips', 'Mindfulness & Study'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-label font-extrabold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts Feed Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs font-label font-bold text-gray-700">Loading community discussions...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-300 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="font-headline font-bold text-gray-900">No discussions found in this category.</p>
              <p className="font-body text-xs text-gray-700 font-medium">Be the first student to share your thoughts or study tip!</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-xl p-5 border border-gray-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-label text-xs font-extrabold">
                      {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h3 className="font-label font-extrabold text-xs text-gray-900">{post.author_name}</h3>
                      <p className="font-body text-[11px] text-gray-700 font-bold">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-900 border border-gray-300 rounded font-label text-[10px] font-extrabold uppercase">
                    {post.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-headline font-bold text-base text-gray-900">{post.title}</h2>
                  <p className="font-body text-xs text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-label text-gray-800 font-bold">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 hover:text-red-800 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-700 fill-red-700" />
                      <span>{post.likes_count || 0} Likes</span>
                    </button>

                    <button
                      onClick={() => openComments(post)}
                      className="flex items-center gap-1.5 hover:text-black transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-700" />
                      <span>{post.comments_count || 0} Comments</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-gray-300 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-headline font-bold text-lg text-gray-900">Create Community Discussion</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-700 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Category</label>
                <select
                  value={postCategory}
                  onChange={e => setPostCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                >
                  <option value="Mindfulness & Study">Mindfulness & Study</option>
                  <option value="Daily Prompt">Daily Prompt</option>
                  <option value="Milestones">Milestones</option>
                  <option value="Study Tips">Study Tips</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  placeholder="Title of your discussion..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-label font-extrabold text-gray-900 uppercase mb-1">Content</label>
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts or study tips..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-label font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 hover:bg-red-800 text-white rounded-lg text-xs font-label font-bold shadow-xs"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-gray-300 shadow-lg space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 shrink-0">
              <h3 className="font-headline font-bold text-base text-gray-900 truncate pr-4">{selectedPost.title}</h3>
              <button onClick={() => setSelectedPost(null)} className="p-1 text-gray-700 hover:text-gray-900 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {postComments.length === 0 ? (
                <p className="text-center py-6 text-xs font-body text-gray-700 font-bold">No comments yet. Start the conversation!</p>
              ) : (
                postComments.map((c, idx) => (
                  <div key={idx} className="p-3 bg-gray-100 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-xs font-label font-bold text-gray-900">
                      <span>{c.author_name}</span>
                      <span className="text-[10px] font-bold text-gray-700">{c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                    </div>
                    <p className="font-body text-xs text-gray-800 font-medium">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 shrink-0">
              <input
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-body font-medium text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white hover:bg-red-800 rounded-lg text-xs font-label font-bold"
              >
                Comment
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
      <Footer />
    </div>
  );
}
