// MusicHub 前端逻辑

const API = '';
let currentUser = null;
let songs = [];
let currentSong = null;
let isPlaying = false;

// DOM 元素
const authPage = document.getElementById('authPage');
const homePage = document.getElementById('homePage');
const adminPage = document.getElementById('adminPage');
const navUser = document.getElementById('navUser');
const songList = document.getElementById('songList');
const adminSongList = document.getElementById('adminSongList');
const audioPlayer = document.getElementById('audioPlayer');

// 播放器元素
const player = document.getElementById('player');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeBarEl = document.getElementById('volumeBar');

// ============ 初始化 ============

async function init() {
  checkAuth();
  setupEventListeners();
}

function checkAuth() {
  fetch(API + '/api/me')
    .then(r => r.json())
    .then(data => {
      if (data.success && data.user) {
        currentUser = data.user;
        showHome();
      } else {
        showAuth();
      }
    });
}

// ============ 页面切换 ============

function showAuth() {
  authPage.style.display = 'flex';
  homePage.style.display = 'none';
  adminPage.style.display = 'none';
  if (player) player.style.display = 'none';
}

function showHome() {
  authPage.style.display = 'none';
  homePage.style.display = 'block';
  adminPage.style.display = 'none';
  
  // 更新导航
  updateNav();
  
  // 加载歌曲
  loadSongs();
}

function showAdmin() {
  authPage.style.display = 'none';
  homePage.style.display = 'none';
  adminPage.style.display = 'block';
  
  // 更新导航
  updateNav();
  
  // 加载歌曲（管理后台）
  loadAdminSongs();
}

function updateNav() {
  const adminLink = document.querySelector('[data-page="admin"]');
  if (currentUser && currentUser.role === 'admin') {
    adminLink.style.display = 'inline';
  } else {
    adminLink.style.display = 'none';
  }
  
  if (currentUser) {
    navUser.innerHTML = `
      <span class="username">${currentUser.username}</span>
      <button class="btn-secondary" id="logoutBtn">退出</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    navUser.innerHTML = '';
  }
}

// ============ 事件监听 ============

function setupEventListeners() {
  // 登录/注册切换
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      if (tab.dataset.tab === 'login') {
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('registerForm').style.display = 'none';
      } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'flex';
      }
    });
  });
  
  // 登录
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(API + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const data = await res.json();
    
    if (data.success) {
      currentUser = data.user;
      showHome();
      showToast('登录成功', 'success');
    } else {
      showToast(data.message, 'error');
    }
  });
  
  // 注册
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(API + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const data = await res.json();
    
    if (data.success) {
      showToast('注册成功，请登录', 'success');
      document.querySelector('[data-tab="login"]').click();
    } else {
      showToast(data.message, 'error');
    }
  });
  
  // 导航
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      if (page === 'home') showHome();
      if (page === 'admin') showAdmin();
    });
  });
  
  // 上传歌曲 - 文件选择
  const dropZone = document.getElementById('dropZone');
  const audioFileInput = document.getElementById('audioFile');
  const fileInfo = document.getElementById('fileInfo');
  let selectedFile = null;
  
  // 点击选择文件
  dropZone.addEventListener('click', () => audioFileInput.click());
  
  // 拖拽上传
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });
  
  // 文件选择处理
  audioFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });
  
  function handleFileSelect(file) {
    if (!file.type.startsWith('audio/')) {
      showToast('请选择音频文件', 'error');
      return;
    }
    
    selectedFile = file;
    
    // 显示文件信息
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = '大小: ' + formatFileSize(file.size);
    fileInfo.style.display = 'block';
    dropZone.style.display = 'none';
    
    // 自动填充歌曲名（去掉扩展名）
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    document.getElementById('inputTitle').value = fileName;
    
    // 自动填充 URL（music/歌曲名.mp3）
    document.getElementById('inputUrl').value = '/music/' + file.name;
    
    // 尝试从文件名提取歌手-歌曲格式 (支持 "歌手 - 歌曲" 或 "歌曲 - 歌手")
    if (fileName.includes(' - ')) {
      const parts = fileName.split(' - ');
      if (parts.length >= 2) {
        // 一般歌手名比较长，歌曲名比较短，通过长度判断
        const first = parts[0].trim();
        const second = parts.slice(1).join(' - ').trim();
        if (second.length > first.length) {
          // 第二部分是歌手（如 "Wake (Live) - Hillsong Young & Free"）
          document.getElementById('inputTitle').value = first;
          document.getElementById('inputArtist').value = second;
        } else {
          // 第一部分是歌手（如 "周杰伦 - 晴天"）
          document.getElementById('inputArtist').value = first;
          document.getElementById('inputTitle').value = second;
        }
      }
    }
    
    // 获取音频时长
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.round(audio.duration);
      document.getElementById('inputDuration').value = duration;
      document.getElementById('fileDuration').textContent = '时长: ' + formatTime(duration);
      URL.revokeObjectURL(audio.src);
    });
  }
  
  // 清除已选文件
  fileInfo.addEventListener('click', (e) => {
    if (e.target === fileInfo || e.target.closest('.file-info')) {
      selectedFile = null;
      fileInfo.style.display = 'none';
      dropZone.style.display = 'block';
      audioFileInput.value = '';
    }
  });
  
  // 封面上传处理
  const coverDropZone = document.getElementById('coverDropZone');
  const coverFileInput = document.getElementById('coverFile');
  const coverPreview = document.getElementById('coverPreview');
  const coverImage = document.getElementById('coverImage');
  const coverRemove = document.getElementById('coverRemove');
  let selectedCoverFile = null;
  
  coverDropZone.addEventListener('click', () => coverFileInput.click());
  
  coverFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleCoverSelect(e.target.files[0]);
    }
  });
  
  function handleCoverSelect(file) {
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }
    
    selectedCoverFile = file;
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
      coverImage.src = e.target.result;
      coverDropZone.style.display = 'none';
      coverPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
  
  coverRemove.addEventListener('click', () => {
    selectedCoverFile = null;
    coverFileInput.value = '';
    coverPreview.style.display = 'none';
    coverDropZone.style.display = 'flex';
  });
  
  // 上传表单提交
  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('inputTitle').value);
    formData.append('artist', document.getElementById('inputArtist').value);
    formData.append('album', document.getElementById('inputAlbum').value);
    formData.append('genre', document.getElementById('inputGenre').value);
    formData.append('duration', document.getElementById('inputDuration').value);
    
    // 添加音频文件
    if (selectedFile) {
      formData.append('audio', selectedFile);
    } else {
      formData.append('url', document.getElementById('inputUrl').value);
    }
    
    // 添加封面文件
    if (selectedCoverFile) {
      formData.append('cover', selectedCoverFile);
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '上传中...';
    
    try {
      const res = await fetch(API + '/api/songs', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('上传成功', 'success');
        // 重置表单
        e.target.reset();
        selectedFile = null;
        selectedCoverFile = null;
        fileInfo.style.display = 'none';
        dropZone.style.display = 'block';
        coverPreview.style.display = 'none';
        coverDropZone.style.display = 'flex';
        loadAdminSongs();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('上传失败', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '上传音乐';
    }
  });
  
  // 播放器控制
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', nextSong);
  audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
  });
  
  progressBar.addEventListener('input', (e) => {
    audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
  });
  
  volumeBarEl.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value / 100;
  });
}

// ============ 歌曲操作 ============

async function loadSongs() {
  const res = await fetch(API + '/api/songs');
  const data = await res.json();
  
  if (data.success) {
    songs = data.songs;
    renderSongList(songList, songs);
    
    if (songs.length === 0) {
      emptyState.style.display = 'block';
      songList.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      songList.style.display = 'grid';
    }
  }
}

async function loadAdminSongs() {
  const res = await fetch(API + '/api/songs');
  const data = await res.json();
  
  if (data.success) {
    songs = data.songs;
    renderAdminSongList(adminSongList, songs);
  }
}

function renderSongList(container, songListData) {
  container.innerHTML = songListData.map(song => `
    <div class="song-card" onclick="playSong('${song.id}')">
      <div class="song-card-cover">
        <img src="${song.cover}" alt="${song.title}" onerror="this.src='https://picsum.photos/seed/${song.id}/300/300'">
        <div class="song-card-play">
          <button class="song-card-play-btn">▶</button>
        </div>
        <div class="song-card-playing" style="display:none">
          <span>🎵</span> 播放中
        </div>
      </div>
      <div class="song-card-info">
        <div class="song-card-title">${song.title}</div>
        <div class="song-card-artist">${song.artist || '未知歌手'}</div>
        <div class="song-card-meta">
          <span class="song-card-genre">${song.genre}</span>
          <span class="song-card-duration">${formatTime(song.duration)}</span>
        </div>
        <div class="song-card-stats">
          <span>🎵 ${song.plays || 0}</span>
          <span class="song-card-like">❤️ ${song.likes?.length || 0}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderAdminSongList(container, songListData) {
  container.innerHTML = songListData.map(song => `
    <div class="song-card">
      <img class="song-cover" src="${song.cover}" alt="${song.title}" onerror="this.src='https://picsum.photos/seed/${song.id}/300/300'">
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist || '未知歌手'}</div>
        <div class="song-meta">
          <span>${song.genre}</span>
          <span>${formatTime(song.duration)}</span>
        </div>
        <div class="song-actions">
          <button class="btn-primary" onclick="playSong('${song.id}')">▶ 播放</button>
          <button class="btn-danger" onclick="deleteSong('${song.id}')">删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ============ 播放器 ============

function playSong(id) {
  const song = songs.find(s => s.id === id);
  if (!song || !song.url) {
    showToast('该歌曲无法播放', 'error');
    return;
  }
  
  currentSong = song;
  if (player) player.style.display = 'flex';
  playerCover.src = song.cover;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist || '未知歌手';
  
  audioPlayer.src = song.url;
  audioPlayer.play();
  isPlaying = true;
  playBtn.textContent = '⏸';
  
  // 更新播放中状态
  document.querySelectorAll('.song-card').forEach(card => card.classList.remove('active'));
  document.querySelectorAll('.song-card-playing').forEach(el => el.style.display = 'none');
  const activeCard = document.querySelector(`.song-card[onclick="playSong('${id}')"]`);
  if (activeCard) {
    activeCard.classList.add('active');
    const playingEl = activeCard.querySelector('.song-card-playing');
    if (playingEl) playingEl.style.display = 'flex';
  }
}

function togglePlay() {
  if (!currentSong) return;
  
  if (isPlaying) {
    audioPlayer.pause();
    playBtn.textContent = '▶';
    document.querySelectorAll('.song-card-playing').forEach(el => el.style.display = 'none');
  } else {
    audioPlayer.play();
    playBtn.textContent = '⏸';
    document.querySelectorAll('.song-card-playing').forEach(el => el.style.display = 'flex');
  }
  isPlaying = !isPlaying;
}

function prevSong() {
  if (!currentSong || songs.length === 0) return;
  const index = songs.findIndex(s => s.id === currentSong.id);
  const prevIndex = (index - 1 + songs.length) % songs.length;
  playSong(songs[prevIndex].id);
}

function nextSong() {
  if (!currentSong || songs.length === 0) return;
  const index = songs.findIndex(s => s.id === currentSong.id);
  const nextIndex = (index + 1) % songs.length;
  playSong(songs[nextIndex].id);
}

function updateProgress() {
  if (audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percent;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  }
}

// ============ 其他操作 ============

async function deleteSong(id) {
  if (!confirm('确定要删除这首歌吗？')) return;
  
  const res = await fetch(API + '/api/songs/' + id, { method: 'DELETE' });
  const data = await res.json();
  
  if (data.success) {
    showToast('删除成功', 'success');
    loadAdminSongs();
  } else {
    showToast(data.message, 'error');
  }
}

async function logout() {
  await fetch(API + '/api/logout', { method: 'POST' });
  currentUser = null;
  songs = [];
  currentSong = null;
  isPlaying = false;
  showAuth();
  showToast('已退出登录', 'success');
}

// ============ 工具函数 ============

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// 暴露全局函数
window.playSong = playSong;
window.deleteSong = deleteSong;

// 启动
init();
