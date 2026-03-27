import React from 'react';
import { Play, Pause, Heart, Music } from 'lucide-react';
import type { Song } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDuration, formatPlays, toggleLike } from '../store/db';

interface SongCardProps {
  song: Song;
  playlist: Song[];
  onUpdate: () => void;
  viewMode?: 'grid' | 'list';
}

const SongCard: React.FC<SongCardProps> = ({ song, playlist, onUpdate, viewMode = 'grid' }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { user } = useAuth();
  const isActive = currentSong?.id === song.id;
  const liked = user ? song.likes.includes(user.id) : false;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      playSong(song, playlist);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleLike(song.id, user.id);
    onUpdate();
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handlePlay}
        className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all duration-200"
        style={{
          background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
          border: `1px solid ${isActive ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}>
        {/* Cover */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={song.cover} alt={song.title} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${song.id}/48/48`; }} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            {isActive && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
          </div>
          {isActive && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.4)' }}>
              <WaveIcon />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: isActive ? '#a78bfa' : '#f1f5f9' }}>{song.title}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>{song.artist} · {song.album}</p>
        </div>

        {/* Genre */}
        <span className="text-xs px-2 py-0.5 rounded-full hidden sm:block"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{song.genre}</span>

        {/* Plays */}
        <span className="text-xs hidden md:block" style={{ color: '#64748b' }}>{formatPlays(song.plays)} 播放</span>

        {/* Duration */}
        <span className="text-xs w-10 text-right" style={{ color: '#64748b' }}>{formatDuration(song.duration)}</span>

        {/* Like */}
        <button onClick={handleLike}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: liked ? '#f87171' : '#64748b' }}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">{song.likes.length}</span>
        </button>
      </div>
    );
  }

  // Grid mode
  return (
    <div className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1"
      style={{
        background: isActive ? 'rgba(124,58,237,0.15)' : 'rgba(22,33,62,0.8)',
        border: `1px solid ${isActive ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.1)'}`,
        boxShadow: isActive ? '0 8px 32px rgba(124,58,237,0.2)' : 'none',
      }}>
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden" onClick={handlePlay}>
        <img src={song.cover} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${song.id}/300/300`; }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.9)' }}>
            {isActive && isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
          </div>
        </div>
        {isActive && isPlaying && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(124,58,237,0.9)' }}>
            <WaveIcon />
            <span className="text-xs text-white">播放中</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex justify-between items-center"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <span className="text-xs text-white opacity-80">{song.genre}</span>
          <span className="text-xs text-white opacity-80">{formatDuration(song.duration)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold truncate" style={{ color: isActive ? '#a78bfa' : '#f1f5f9' }}>{song.title}</h3>
        <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs flex items-center gap-1" style={{ color: '#64748b' }}>
            <Music size={10} /> {formatPlays(song.plays)}
          </span>
          <button onClick={handleLike}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: liked ? '#f87171' : '#64748b' }}>
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
            {song.likes.length}
          </button>
        </div>
      </div>
    </div>
  );
};

const WaveIcon: React.FC = () => (
  <div className="flex items-end gap-0.5 h-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="w-1 rounded-full"
        style={{
          background: '#a78bfa',
          height: `${8 + i * 4}px`,
          animation: `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
        }} />
    ))}
    <style>{`
      @keyframes wave {
        from { transform: scaleY(0.4); }
        to { transform: scaleY(1); }
      }
    `}</style>
  </div>
);

export default SongCard;
