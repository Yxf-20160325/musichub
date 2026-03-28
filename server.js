const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'music');
const COVER_DIR = path.join(__dirname, 'public', 'covers');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(COVER_DIR)) {
  fs.mkdirSync(COVER_DIR, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, COVER_DIR);
    } else {
      cb(null, UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/flac', 'audio/x-m4a'];
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传音频文件'), false);
    }
  }
});

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'musichub-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// 数据存储
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [
        { id: 'admin_1', username: 'admin', email: 'admin@musichub.com', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() }
      ],
      songs: [],
      currentUser: null
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============ 认证 API ============

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.json({ success: false, message: '请填写完整信息' });
  }
  
  const data = loadData();
  if (data.users.find(u => u.email === email)) {
    return res.json({ success: false, message: '邮箱已被注册' });
  }
  
  const user = {
    id: generateId('user'),
    username,
    email,
    password,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  data.users.push(user);
  saveData(data);
  
  res.json({ success: true, message: '注册成功' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  
  const user = data.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.json({ success: false, message: '邮箱或密码错误' });
  }
  
  req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
  res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, user: null });
  }
});

// ============ 音乐 API ============

app.get('/api/songs', (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, message: '请先登录', songs: [] });
  }
  const data = loadData();
  res.json({ success: true, songs: data.songs });
});

// 上传歌曲（带文件）
app.post('/api/songs', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.json({ success: false, message: '无权限' });
  }
  
  const { title, artist, album, genre, duration, url } = req.body;
  if (!title) {
    return res.json({ success: false, message: '请填写歌曲名称' });
  }
  
  // 检查是否有文件或URL
  const audioFile = req.files?.['audio']?.[0];
  const coverFile = req.files?.['cover']?.[0];
  if (!audioFile && !url) {
    return res.json({ success: false, message: '请上传音频文件或填写音乐链接' });
  }
  
  const data = loadData();
  
  // 文件路径
  let fileUrl = '';
  if (audioFile) {
    fileUrl = '/music/' + audioFile.filename;
  } else if (url) {
    fileUrl = url;
  }
  
  // 封面路径
  let coverUrl = '';
  if (coverFile) {
    coverUrl = '/covers/' + coverFile.filename;
  }
  
  const song = {
    id: generateId('song'),
    title,
    artist: artist || '',
    album: album || '',
    genre: genre || '流行',
    duration: parseInt(duration) || 180,
    cover: coverUrl || `https://picsum.photos/seed/${Date.now()}/300/300`,
    url: fileUrl,
    uploadedBy: req.session.user.id,
    uploadedAt: new Date().toISOString(),
    plays: 0,
    likes: []
  };
  
  data.songs.push(song);
  saveData(data);
  
  res.json({ success: true, song });
});

// 删除歌曲
app.delete('/api/songs/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.json({ success: false, message: '无权限' });
  }
  
  const data = loadData();
  const index = data.songs.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.json({ success: false, message: '歌曲不存在' });
  }
  
  // 删除音频文件
  const song = data.songs[index];
  if (song.url && song.url.startsWith('/music/')) {
    const filePath = path.join(__dirname, 'public', song.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  data.songs.splice(index, 1);
  saveData(data);
  
  res.json({ success: true });
});

app.put('/api/songs/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.json({ success: false, message: '无权限' });
  }
  
  const data = loadData();
  const song = data.songs.find(s => s.id === req.params.id);
  if (!song) {
    return res.json({ success: false, message: '歌曲不存在' });
  }
  
  Object.assign(song, req.body);
  saveData(data);
  
  res.json({ success: true, song });
});

app.get('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.json({ success: false, message: '无权限' });
  }
  
  const data = loadData();
  const users = data.users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt }));
  res.json({ success: true, users });
});

app.post('/api/songs/:id/like', (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, message: '请先登录' });
  }
  
  const data = loadData();
  const song = data.songs.find(s => s.id === req.params.id);
  if (!song) {
    return res.json({ success: false, message: '歌曲不存在' });
  }
  
  const userId = req.session.user.id;
  const index = song.likes.indexOf(userId);
  
  if (index === -1) {
    song.likes.push(userId);
  } else {
    song.likes.splice(index, 1);
  }
  
  saveData(data);
  res.json({ success: true, liked: index === -1 });
});

// 前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MusicHub 服务器运行在 http://localhost:${PORT}`);
});
