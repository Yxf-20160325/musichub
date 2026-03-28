import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, Home, Shield, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setDropOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16"
      style={{
        background: 'rgba(15,15,15,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.15)',
      }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
          <Music size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg text-white">MusicHub</span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        <NavLink to="/" active={location.pathname === '/'} icon={<Home size={16} />} label="首页" />
        {user?.role === 'admin' && (
          <NavLink to="/admin" active={location.pathname.startsWith('/admin')}
            icon={<Shield size={16} />} label="管理后台" />
        )}
      </nav>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
          style={{
            background: dropOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">{user?.username}</span>
          {user?.role === 'admin' && (
            <span className="text-xs px-1.5 py-0.5 rounded-full hidden sm:block"
              style={{ background: 'rgba(124,58,237,0.3)', color: '#a78bfa' }}>管理员</span>
          )}
          <ChevronDown size={14} className="text-gray-400" style={{
            transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }} />
        </button>

        {dropOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setDropOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50"
              style={{
                background: '#1a1a2e',
                border: '1px solid rgba(124,58,237,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/'); setDropOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-white/5"
                style={{ color: '#94a3b8' }}>
                <User size={14} /> 个人中心
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-red-500/10"
                style={{ color: '#f87171' }}>
                <LogOut size={14} /> 退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

const NavLink: React.FC<{ to: string; active: boolean; icon: React.ReactNode; label: string }> = ({
  to, active, icon, label
}) => (
  <Link to={to}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline"
    style={{
      color: active ? '#a78bfa' : '#94a3b8',
      background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
    }}>
    {icon}{label}
  </Link>
);

export default Navbar;
