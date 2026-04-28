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
    <div className="w-[260px] bg-card border-r border-border px-4 py-6 flex flex-col h-screen sticky top-0">
      <div className="px-2.5 mb-10">
        <h2 className="text-primary text-[1.4rem] font-bold tracking-tight">
          DEXA <span className="text-text-primary">ABSENSI</span>
        </h2>
        <div className="mt-4 text-text-secondary text-[0.85rem]">
          <div className="font-semibold text-text-primary mb-0.5">{user?.username}</div>
          <div>Role: <span className="px-2.5 py-1 rounded-full text-[0.75rem] font-semibold tracking-wide bg-primary/15 text-primary border border-primary/30">{user?.role}</span></div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md no-underline transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isActive 
                  ? 'text-primary bg-primary-glow font-semibold' 
                  : 'text-text-secondary font-medium hover:bg-hover hover:text-text-primary'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-transparent text-danger border border-danger px-4 py-2 rounded-sm transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] text-[0.85rem] font-medium hover:bg-danger/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
