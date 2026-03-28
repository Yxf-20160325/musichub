import type { User, Song } from '../types';

// ---- 用户相关 ----
export const getUsers = (): User[] => {
  const raw = localStorage.getItem('mh_users');
  if (!raw) {
    // 默认管理员账号
    const defaultUsers: User[] = [
      {
        id: 'admin_1',
        username: 'admin',
        email: 'admin@musichub.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('mh_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(raw);
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('mh_users', JSON.stringify(users));
};

export const getUserByEmail = (email: string): User | null => {
  return getUsers().find((u) => u.email === email) || null;
};

export const createUser = (
  username: string,
  email: string,
  _password: string
): User => {
  const users = getUsers();
  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    email,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  // 存储密码（实际项目应该哈希）
  const passwords = getPasswords();
  passwords[email] = _password;
  localStorage.setItem('mh_passwords', JSON.stringify(passwords));
  return newUser;
};

export const getPasswords = (): Record<string, string> => {
  const raw = localStorage.getItem('mh_passwords');
  if (!raw) {
    // 默认管理员密码
    const defaults: Record<string, string> = {
      'admin@musichub.com': 'admin123',
    };
    localStorage.setItem('mh_passwords', JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(raw);
};

export const validateLogin = (
  email: string,
  password: string
): User | null => {
  const user = getUserByEmail(email);
  if (!user) return null;
  const passwords = getPasswords();
  if (passwords[email] !== password) return null;
  return user;
};

// ---- 当前登录用户 ----
export const getCurrentUser = (): User | null => {
  const raw = sessionStorage.getItem('mh_current_user');
  if (!raw) return null;
  return JSON.parse(raw);
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    sessionStorage.setItem('mh_current_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('mh_current_user');
  }
};

// ---- 歌曲相关 ----
export const getSongs = (): Song[] => {
  const raw = localStorage.getItem('mh_songs');
  if (!raw) return [];
  return JSON.parse(raw);
};

export const saveSongs = (songs: Song[]) => {
  localStorage.setItem('mh_songs', JSON.stringify(songs));
};

export const addSong = (song: Song) => {
  const songs = getSongs();
  songs.unshift(song);
  saveSongs(songs);
};

export const deleteSong = (id: string) => {
  const songs = getSongs().filter((s) => s.id !== id);
  saveSongs(songs);
};

export const updateSong = (updated: Song) => {
  const songs = getSongs().map((s) => (s.id === updated.id ? updated : s));
  saveSongs(songs);
};

export const toggleLike = (songId: string, userId: string): Song | null => {
  const songs = getSongs();
  const song = songs.find((s) => s.id === songId);
  if (!song) return null;
  if (song.likes.includes(userId)) {
    song.likes = song.likes.filter((id) => id !== userId);
  } else {
    song.likes.push(userId);
  }
  saveSongs(songs);
  return song;
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatPlays = (plays: number): string => {
  if (plays >= 10000) return `${(plays / 10000).toFixed(1)}万`;
  return plays.toString();
};
