import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateLogin, createUser, getUserByEmail } from '../store/db';

type Tab = 'login' | 'register';

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = validateLogin(loginEmail, loginPassword);
      setLoading(false);
      if (!user) {
        setError('邮箱或密码错误');
        return;
      }
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/');
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regUsername || !regEmail || !regPassword || !regConfirm) {
      setError('请填写所有字段');
      return;
    }
    if (regPassword.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('两次密码不一致');
      return;
    }
    if (getUserByEmail(regEmail)) {
      setError('该邮箱已被注册');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = createUser(regUsername, regEmail, regPassword);
      setLoading(false);
      login(user);
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
        {/* 音符装饰 */}
        {['♪', '♫', '♬', '♩'].map((note, i) => (
          <span key={i} className="absolute text-4xl opacity-5 select-none"
            style={{
              top: `${15 + i * 20}%`,
              left: `${5 + i * 22}%`,
              transform: `rotate(${i * 15}deg)`,
              color: '#7c3aed',
              fontSize: `${2 + i * 0.5}rem`,
            }}>
            {note}
          </span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            <Music size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MusicHub</h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>发现好音乐，从这里开始</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 backdrop-blur-sm"
          style={{ background: 'rgba(22, 33, 62, 0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <button key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: tab === t ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                  color: tab === t ? '#fff' : '#94a3b8',
                }}>
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField label="邮箱" type="email" placeholder="请输入邮箱"
                value={loginEmail} onChange={setLoginEmail} />
              <InputField label="密码"
                type={showPwd ? 'text' : 'password'}
                placeholder="请输入密码"
                value={loginPassword} onChange={setLoginPassword}
                suffix={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="text-gray-400 hover:text-gray-200 transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>
                管理员账号：admin@musichub.com / admin123
              </div>
              <SubmitButton loading={loading} text="登录" />
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <InputField label="用户名" type="text" placeholder="请输入用户名"
                value={regUsername} onChange={setRegUsername} />
              <InputField label="邮箱" type="email" placeholder="请输入邮箱"
                value={regEmail} onChange={setRegEmail} />
              <InputField label="密码"
                type={showPwd ? 'text' : 'password'}
                placeholder="至少6位密码"
                value={regPassword} onChange={setRegPassword}
                suffix={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="text-gray-400 hover:text-gray-200 transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <InputField label="确认密码" type="password" placeholder="再次输入密码"
                value={regConfirm} onChange={setRegConfirm} />
              <SubmitButton loading={loading} text="注册并登录" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: React.ReactNode;
}> = ({ label, type, placeholder, value, onChange, suffix }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
    <div className="relative flex items-center rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-white placeholder-gray-500"
        style={{ caretColor: '#7c3aed' }}
      />
      {suffix && <div className="pr-3">{suffix}</div>}
    </div>
  </div>
);

const SubmitButton: React.FC<{ loading: boolean; text: string }> = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2"
    style={{
      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      opacity: loading ? 0.7 : 1,
    }}>
    {loading && <Loader2 size={16} className="animate-spin" />}
    {text}
  </button>
);

export default AuthPage;
