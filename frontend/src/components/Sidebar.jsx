import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, ShieldAlert, LogOut } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { name: 'Leave Management', path: '/leaves', icon: <CalendarDays size={20} /> },
    { name: 'Violations', path: '/violations', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-brand-500">Resi<span className="text-white">CTRL</span></h1>
        <p className="text-slate-400 text-xs mt-1">Hostel Operations System</p>
      </div>
      
      <nav className="flex-1 px-4 mt-8 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-brand-600 shadow-lg shadow-brand-500/30' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
