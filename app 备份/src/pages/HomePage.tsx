import React, { useState, useEffect, useMemo } from 'react';
import { Search, Grid3X3, List, Music2, TrendingUp, Heart } from 'lucide-react';
import type { Song } from '../types';
import { getSongs } from '../store/db';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import SongCard from '../components/SongCard';
import Navbar from '../components/Navbar';
import MusicPlayer from '../components/MusicPlayer';

type Tab = 'all' | 'hot' | 'liked';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [genre, setGenre] = useState('全部');
  const [tab, setTab] = useState<Tab>('all');

  const refresh = () => setSongs(getSongs());
  useEffect(() => { refresh(); }, []);

  const genres = useMemo(() => {
    const gs = ['全部', ...new Set(songs.map((s) => s.genre))];
    return gs;
  }, [songs]);

  const filtered = useMemo(() => {
    let list = songs;
    if (tab === 'hot') list = [...list].sort((a, b) => b.plays - a.plays);
    if (tab === 'liked') list = list.filter((s) => user && s.likes.includes(user.id));
    if (genre !== '全部') list = list.filter((s) => s.genre === genre);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }
    return list;
  }, [songs, tab, genre, search, user]);

  const handlePlayAll = () => {
    if (filtered.length > 0) playSong(filtered[0], filtered);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero Banner */}
      <div className="relative overflow-hidden px-6 py-10"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            你好，{user?.username} 👋
          </h1>
          <p className="mt-2 text-base" style={{ color: '#94a3b8' }}>
            发现 {songs.length} 首精选音乐，开始你的音乐之旅
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Music2 size={16} /> 播放全部
            </button>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)', color: '#94a3b8' }}>
              <TrendingUp size={16} style={{ color: '#a78bfa' }} />
              今日热门：{songs.sort((a, b) => b.plays - a.plays)[0]?.title || '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {([['all', '全部音乐', <Music2 size={14} />], ['hot', '热门排行', <TrendingUp size={14} />], ['liked', '我的收藏', <Heart size={14} />]] as const).map(([t, label, icon]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: tab === t ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                color: tab === t ? '#fff' : '#94a3b8',
              }}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="搜索歌曲、歌手、专辑..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(124,58,237,0.2)',
                caretColor: '#7c3aed',
              }}
            />
          </div>

          {/* Genre filter */}
          <div className="flex gap-2 flex-wrap">
            {genres.slice(0, 6).map((g) => (
              <button key={g} onClick={() => setGenre(g)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: genre === g ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${genre === g ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.1)'}`,
                  color: genre === g ? '#a78bfa' : '#94a3b8',
                }}>
                {g}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['grid', 'list'] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  background: viewMode === m ? 'rgba(124,58,237,0.3)' : 'transparent',
                  color: viewMode === m ? '#a78bfa' : '#64748b',
                }}>
                {m === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm mb-4" style={{ color: '#64748b' }}>
          共 {filtered.length} 首
        </p>

        {/* Songs Grid/List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Music2 size={48} className="mx-auto mb-3 opacity-20" style={{ color: '#7c3aed' }} />
            <p style={{ color: '#64748b' }}>
              {tab === 'liked' ? '还没有收藏的歌曲' : '没有找到匹配的歌曲'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((song) => (
              <SongCard key={song.id} song={song} playlist={filtered}
                onUpdate={refresh} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* List header */}
            <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium" style={{ color: '#475569' }}>
              <div className="w-12">封面</div>
              <div className="flex-1">歌曲</div>
              <div className="hidden sm:block w-20">流派</div>
              <div className="hidden md:block w-20">播放量</div>
              <div className="w-10 text-right">时长</div>
              <div className="w-12 text-right">收藏</div>
            </div>
            {filtered.map((song) => (
              <SongCard key={song.id} song={song} playlist={filtered}
                onUpdate={refresh} viewMode="list" />
            ))}
          </div>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
};

export default HomePage;
