import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import type { Song, PlayerState } from '../types';

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, playlist?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    volume: 0.7,
    playlist: [],
    currentIndex: 0,
    shuffle: false,
    repeat: 'none',
  });

  // 创建 audio 元素
  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    audio.onended = () => {
      setState((prev) => {
        if (prev.repeat === 'one') {
          audio.currentTime = 0;
          audio.play();
          return prev;
        }
        const nextIndex = getNextIndex(prev);
        if (nextIndex === -1) return { ...prev, isPlaying: false };
        const nextSong = prev.playlist[nextIndex];
        audio.src = nextSong.url;
        if (nextSong.url) audio.play();
        return { ...prev, currentSong: nextSong, currentIndex: nextIndex, currentTime: 0 };
      });
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNextIndex = (s: PlayerState): number => {
    if (s.playlist.length === 0) return -1;
    if (s.shuffle) {
      let idx = Math.floor(Math.random() * s.playlist.length);
      if (idx === s.currentIndex && s.playlist.length > 1) {
        idx = (idx + 1) % s.playlist.length;
      }
      return idx;
    }
    const next = s.currentIndex + 1;
    if (next >= s.playlist.length) {
      return s.repeat === 'all' ? 0 : -1;
    }
    return next;
  };

  const playSong = useCallback((song: Song, playlist?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const list = playlist || [song];
    const idx = list.findIndex((s) => s.id === song.id);
    audio.src = song.url || '';
    if (song.url) {
      audio.play().catch(() => {});
    }
    setState((prev) => ({
      ...prev,
      currentSong: song,
      isPlaying: !!song.url,
      currentTime: 0,
      playlist: list,
      currentIndex: idx >= 0 ? idx : 0,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentSong) return;
    if (state.isPlaying) {
      audio.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audio.play().catch(() => {});
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [state.isPlaying, state.currentSong]);

  const next = useCallback(() => {
    setState((prev) => {
      const audio = audioRef.current;
      const nextIndex = getNextIndex(prev);
      if (nextIndex === -1 || !audio) return prev;
      const nextSong = prev.playlist[nextIndex];
      audio.src = nextSong.url || '';
      if (nextSong.url) audio.play().catch(() => {});
      return { ...prev, currentSong: nextSong, currentIndex: nextIndex, currentTime: 0, isPlaying: !!nextSong.url };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prev = useCallback(() => {
    setState((prev) => {
      const audio = audioRef.current;
      if (!audio) return prev;
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return { ...prev, currentTime: 0 };
      }
      let prevIndex = prev.currentIndex - 1;
      if (prevIndex < 0) prevIndex = prev.playlist.length - 1;
      const prevSong = prev.playlist[prevIndex];
      if (!prevSong) return prev;
      audio.src = prevSong.url || '';
      if (prevSong.url) audio.play().catch(() => {});
      return { ...prev, currentSong: prevSong, currentIndex: prevIndex, currentTime: 0, isPlaying: !!prevSong.url };
    });
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = vol;
    setState((prev) => ({ ...prev, volume: vol }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: PlayerState['repeat'][] = ['none', 'all', 'one'];
      const idx = modes.indexOf(prev.repeat);
      return { ...prev, repeat: modes[(idx + 1) % 3] };
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
