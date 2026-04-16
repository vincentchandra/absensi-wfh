import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiHome, FiClock, FiUsers, FiLogOut, FiActivity } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = user?.role === 'ADMIN' 
    ? [
        { path: '/admin/employees', name: 'Manajemen Karyawan', icon: <FiUsers /> },
        { path: '/admin/attendance', name: 'Monitoring Absensi', icon: <FiActivity /> },
      ]
    : [
        { path: '/dashboard', name: 'Dashboard', icon: <FiHome /> },
        { path: '/my-attendance', name: 'Riwayat Absensi', icon: <FiClock /> },
      ];

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ padding: '0 10px', marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--primary-color)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          DEXA <span style={{ color: 'var(--text-primary)' }}>HRIS</span>
        </h2>
        <div style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{user?.username}</div>
          <div>Role: <span className="badge badge-info">{user?.role}</span></div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              transition: 'var(--transition)'
            })}
            className={({ isActive }) => isActive ? '' : 'nav-hover'}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="btn-danger"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <FiLogOut /> Logout
      </button>

      {/* Injecting nav-hover globally because it's a small component */}
      <style>{`
        .nav-hover:hover {
          background-color: var(--bg-hover) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
