import React from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1,
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { formatDuration } from '../store/db';

const MusicPlayer: React.FC = () => {
  const {
    currentSong, isPlaying, currentTime, volume,
    shuffle, repeat,
    togglePlay, next, prev, seek, setVolume,
    toggleShuffle, toggleRepeat,
  } = usePlayer();

  if (!currentSong) return null;

  const duration = currentSong.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(124,58,237,0.2)',
      }}>
      {/* Progress bar */}
      <div className="relative h-1 group cursor-pointer"
        style={{ background: 'rgba(124,58,237,0.2)' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          seek(ratio * duration);
        }}>
        <div className="h-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
          }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
          style={{ left: `${progress}%` }} />
      </div>

      <div className="flex items-center px-4 md:px-6 h-16 gap-4">
        {/* Song info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={currentSong.cover} alt={currentSong.title}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/default/40/40'; }} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <CtrlBtn onClick={toggleShuffle} active={shuffle} title="随机播放">
            <Shuffle size={16} />
          </CtrlBtn>
          <CtrlBtn onClick={prev} title="上一首">
            <SkipBack size={20} />
          </CtrlBtn>
          <button onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <CtrlBtn onClick={next} title="下一首">
            <SkipForward size={20} />
          </CtrlBtn>
          <CtrlBtn onClick={toggleRepeat} active={repeat !== 'none'} title="循环">
            {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </CtrlBtn>
        </div>

        {/* Time + Volume */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-xs hidden sm:block" style={{ color: '#64748b' }}>
            {formatDuration(Math.floor(currentTime))} / {formatDuration(duration)}
          </span>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="transition-colors" style={{ color: '#94a3b8' }}>
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CtrlBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, active, title, children }) => (
  <button onClick={onClick} title={title}
    className="p-1.5 rounded-lg transition-colors"
    style={{ color: active ? '#a78bfa' : '#64748b' }}>
    {children}
  </button>
);

export default MusicPlayer;
