import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Music, Users, Upload,
  X, Save, BarChart3, Search, Shield,
} from 'lucide-react';
import type { Song } from '../types';
import {
  getSongs, addSong, deleteSong, updateSong,
  getUsers, formatDuration, formatPlays,
} from '../store/db';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import MusicPlayer from '../components/MusicPlayer';

type AdminTab = 'songs' | 'users' | 'stats';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState(getUsers());
  const [showForm, setShowForm] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = () => { setSongs(getSongs()); setUsers(getUsers()); };
  useEffect(() => { refresh(); }, []);

  const filtered = songs.filter((s) => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
  });

  const handleDelete = (id: string) => {
    deleteSong(id);
    setDeleteConfirm(null);
    refresh();
  };

  const stats = {
    totalSongs: songs.length,
    totalUsers: users.length,
    totalPlays: songs.reduce((sum, s) => sum + s.plays, 0),
    totalLikes: songs.reduce((sum, s) => sum + s.likes.length, 0),
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Admin Header */}
      <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">管理后台</h1>
            <p className="text-sm" style={{ color: '#64748b' }}>管理员：{user?.username}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: '歌曲总数', value: stats.totalSongs, icon: <Music size={20} />, color: '#7c3aed' },
            { label: '注册用户', value: stats.totalUsers, icon: <Users size={20} />, color: '#0ea5e9' },
            { label: '总播放量', value: formatPlays(stats.totalPlays), icon: <BarChart3 size={20} />, color: '#10b981' },
            { label: '总收藏数', value: stats.totalLikes, icon: <Music size={20} />, color: '#f59e0b' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-2xl p-4"
              style={{ background: 'rgba(22,33,62,0.8)', border: '1px solid rgba(124,58,237,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}20`, color }}>
                  {icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {([['songs', '音乐管理', <Music size={14} />], ['users', '用户管理', <Users size={14} />]] as const).map(([t, label, icon]) => (
            <button key={t} onClick={() => setTab(t as AdminTab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: tab === t ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                color: tab === t ? '#fff' : '#94a3b8',
              }}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Songs Tab */}
        {tab === 'songs' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                <input type="text" placeholder="搜索歌曲..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)', caretColor: '#7c3aed' }}
                />
              </div>
              <button onClick={() => { setEditSong(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                <Plus size={16} /> 上传音乐
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(22,33,62,0.8)', border: '1px solid rgba(124,58,237,0.1)' }}>
              {/* Table header */}
              <div className="flex items-center gap-4 px-4 py-3 text-xs font-medium"
                style={{ borderBottom: '1px solid rgba(124,58,237,0.1)', color: '#64748b' }}>
                <div className="w-10">封面</div>
                <div className="flex-1">歌曲信息</div>
                <div className="hidden sm:block w-16">流派</div>
                <div className="hidden md:block w-20 text-right">播放量</div>
                <div className="w-16 text-right">时长</div>
                <div className="w-20 text-right">操作</div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Music size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#7c3aed' }} />
                  <p style={{ color: '#64748b' }}>暂无歌曲，点击"上传音乐"添加</p>
                </div>
              ) : (
                filtered.map((song) => (
                  <div key={song.id}
                    className="flex items-center gap-4 px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                    <img src={song.cover} alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${song.id}/40/40`; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">{song.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{song.artist} · {song.album}</p>
                    </div>
                    <span className="hidden sm:block text-xs px-2 py-0.5 rounded-full w-16 text-center"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{song.genre}</span>
                    <span className="hidden md:block text-xs w-20 text-right" style={{ color: '#64748b' }}>{formatPlays(song.plays)}</span>
                    <span className="text-xs w-16 text-right" style={{ color: '#64748b' }}>{formatDuration(song.duration)}</span>
                    <div className="flex items-center gap-1.5 w-20 justify-end">
                      <button onClick={() => { setEditSong(song); setShowForm(true); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: '#a78bfa' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(song.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                        style={{ color: '#f87171' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(22,33,62,0.8)', border: '1px solid rgba(124,58,237,0.1)' }}>
            <div className="flex items-center gap-4 px-4 py-3 text-xs font-medium"
              style={{ borderBottom: '1px solid rgba(124,58,237,0.1)', color: '#64748b' }}>
              <div className="flex-1">用户信息</div>
              <div className="w-20 text-center">角色</div>
              <div className="hidden sm:block w-40">注册时间</div>
            </div>
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.username}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{u.email}</p>
                  </div>
                </div>
                <span className="w-20 text-center text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: u.role === 'admin' ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.15)',
                    color: u.role === 'admin' ? '#a78bfa' : '#34d399',
                  }}>
                  {u.role === 'admin' ? '管理员' : '普通用户'}
                </span>
                <span className="hidden sm:block text-xs w-40" style={{ color: '#64748b' }}>
                  {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload/Edit Form Modal */}
      {showForm && (
        <SongFormModal
          song={editSong}
          adminId={user!.id}
          onClose={() => setShowForm(false)}
          onSave={() => { refresh(); setShowForm(false); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: '#1a1a2e', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h3 className="text-base font-semibold text-white mb-2">确认删除？</h3>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>此操作不可撤销，歌曲将被永久删除。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                取消
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: 'rgba(239,68,68,0.8)' }}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <MusicPlayer />
    </div>
  );
};

// ---- 上传/编辑歌曲表单 ----
const SongFormModal: React.FC<{
  song: Song | null;
  adminId: string;
  onClose: () => void;
  onSave: () => void;
}> = ({ song, adminId, onClose, onSave }) => {
  const isEdit = !!song;
  const [form, setForm] = useState({
    title: song?.title || '',
    artist: song?.artist || '',
    album: song?.album || '',
    genre: song?.genre || '流行',
    duration: song?.duration || 180,
    cover: song?.cover || '',
    url: song?.url || '',
  });
  const [urlMode, setUrlMode] = useState<'local' | 'remote'>('local');

  const genres = ['流行', '摇滚', '民谣', '古典', '爵士', '电子', '嘻哈', 'R&B', '其他'];

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 选择本地文件 → 自动填充路径 /music/文件名
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    set('url', `/music/${fileName}`);
    // 尝试读取音频时长
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      set('duration', Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
  };

  const handleSave = () => {
    if (!form.title || !form.artist) return;
    if (isEdit && song) {
      updateSong({ ...song, ...form });
    } else {
      const newSong: Song = {
        id: `song_${Date.now()}`,
        ...form,
        cover: form.cover || `https://picsum.photos/seed/song${Date.now()}/300/300`,
        uploadedBy: adminId,
        uploadedAt: new Date().toISOString(),
        plays: 0,
        likes: [],
      };
      addSong(newSong);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
          <div className="flex items-center gap-2">
            <Upload size={18} style={{ color: '#a78bfa' }} />
            <h2 className="text-base font-semibold text-white">
              {isEdit ? '编辑歌曲' : '上传新音乐'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Preview Cover */}
          {form.cover && (
            <div className="flex justify-center">
              <img src={form.cover} alt="封面预览"
                className="w-24 h-24 rounded-xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/default/96/96'; }} />
            </div>
          )}

          <FormInput label="歌曲名称 *" placeholder="请输入歌曲名称"
            value={form.title} onChange={(v) => set('title', v)} />
          <FormInput label="歌手" placeholder="请输入歌手名"
            value={form.artist} onChange={(v) => set('artist', v)} />
          <FormInput label="专辑" placeholder="请输入专辑名"
            value={form.album} onChange={(v) => set('album', v)} />

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>流派</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button key={g} type="button" onClick={() => set('genre', g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.genre === g ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${form.genre === g ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.05)'}`,
                    color: form.genre === g ? '#a78bfa' : '#94a3b8',
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              时长（秒）— 当前：{Math.floor(form.duration / 60)}:{String(form.duration % 60).padStart(2, '0')}
            </label>
            <input type="number" min={1} max={3600}
              value={form.duration} onChange={(e) => set('duration', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)', caretColor: '#7c3aed' }}
            />
          </div>

          <FormInput label="封面图 URL" placeholder="输入图片地址（留空自动生成）"
            value={form.cover} onChange={(v) => set('cover', v)} />

          {/* Audio URL — local / remote tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" style={{ color: '#94a3b8' }}>音频文件</label>
              <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {(['local', 'remote'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setUrlMode(m)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: urlMode === m ? 'rgba(124,58,237,0.5)' : 'transparent',
                      color: urlMode === m ? '#e9d5ff' : '#64748b',
                    }}>
                    {m === 'local' ? '本地文件' : '网络链接'}
                  </button>
                ))}
              </div>
            </div>

            {urlMode === 'local' ? (
              <div>
                {/* File picker */}
                <label className="flex flex-col items-center justify-center gap-2 w-full py-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'rgba(124,58,237,0.05)',
                    border: '2px dashed rgba(124,58,237,0.3)',
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload size={24} style={{ color: '#7c3aed' }} />
                  <span className="text-sm" style={{ color: '#a78bfa' }}>点击选择音频文件</span>
                  <span className="text-xs" style={{ color: '#475569' }}>支持 .mp3 .ogg .wav .flac</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
                </label>
                {/* Path hint */}
                {form.url && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <Music size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                    <span className="text-xs font-mono truncate" style={{ color: '#c4b5fd' }}>{form.url}</span>
                  </div>
                )}
                <p className="mt-2 text-xs leading-5" style={{ color: '#475569' }}>
                  选择文件后会自动填充路径为 <code className="px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: '#a78bfa' }}>/music/文件名</code>。<br />
                  请将对应音频文件手动放入 <code className="px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: '#a78bfa' }}>public/music/</code> 目录后再保存。
                </p>
              </div>
            ) : (
              <div>
                <FormInput label="" placeholder="输入音频网络地址（http/https）"
                  value={form.url} onChange={(v) => set('url', v)} />
                <p className="mt-1 text-xs" style={{ color: '#475569' }}>
                  支持任意可访问的 .mp3 / .ogg / .wav 网络链接
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
            取消
          </button>
          <button onClick={handleSave}
            disabled={!form.title || !form.artist}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            <Save size={15} /> {isEdit ? '保存修改' : '上传音乐'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
    <input type="text" placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)', caretColor: '#7c3aed' }}
    />
  </div>
);

export default AdminPage;
