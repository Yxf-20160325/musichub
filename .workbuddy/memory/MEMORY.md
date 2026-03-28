# MEMORY.md - MusicHub 项目长期记忆

## 项目：MusicHub 音乐平台
- **目录**：C:\Users\win\Desktop\代码\music\app\
- **技术栈**：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + React Router v7
- **管理员账号**：admin@musichub.com / admin123
- **数据存储**：全部使用 localStorage（模拟后端，无需服务器）
- **待安装依赖**：`npm install react-router-dom lucide-react` + `npm install -D tailwindcss @tailwindcss/vite`

## 文件结构
```
src/
  types/index.ts        - 类型定义（User, Song, AuthState, PlayerState）
  store/db.ts           - localStorage 数据操作（用户、歌曲 CRUD）
  contexts/
    AuthContext.tsx     - 登录/注销/权限状态
    PlayerContext.tsx   - 全局音乐播放状态
  pages/
    AuthPage.tsx        - 登录/注册页
    HomePage.tsx        - 音乐首页（需登录）
    AdminPage.tsx       - 管理员后台（音乐上传/编辑/删除 + 用户列表）
  components/
    Navbar.tsx          - 顶部导航
    MusicPlayer.tsx     - 底部播放器
    SongCard.tsx        - 歌曲卡片（网格/列表两种视图）
    ProtectedRoute.tsx  - 路由守卫
```
