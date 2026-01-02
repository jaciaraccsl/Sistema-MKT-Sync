
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NAV_ITEMS } from '../constants';
import { Bell, Search, LogOut, Menu, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
  const { currentUser, notifications, markNotificationRead, logout, systemLogo } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

  const handleLogout = () => {
    if(confirm("Deseja realmente sair?")) {
        logout();
    }
  };

  return (
    <div className="flex h-screen bg-joy-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-joy-200 shadow-xl z-20">
        <div className="p-6 flex flex-col items-center justify-center">
          {systemLogo ? (
              <img src={systemLogo} alt="Logo" className="h-12 mb-2 object-contain" />
          ) : (
              <div className="w-10 h-10 bg-gradient-to-tr from-joy-400 to-purple-500 rounded-lg flex items-center justify-center text-white mb-2 shadow-md">
                 <Sparkles size={20} />
              </div>
          )}
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-joy-500 to-purple-600">
            Sync Marketing
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                  isActive
                    ? "bg-gradient-to-r from-joy-400 to-purple-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:bg-joy-100 hover:text-joy-600"
                )
              }
            >
              <span className="group-hover:animate-bounce">{item.icon}</span>
              <span className="font-bold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-joy-100 rounded-3xl border border-joy-200">
            <img src={currentUser?.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             <Menu size={24} />
          </button>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-joy-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar tarefas..." 
                className="w-full bg-white border border-joy-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-joy-300 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-full hover:bg-white transition-colors"
            >
              <Bell size={24} className={unreadCount > 0 ? "text-joy-600" : "text-gray-400"} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-joy-100 p-4 z-50 animate-fade-in">
                <h3 className="font-bold text-gray-700 mb-2">Notificações 🔔</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                  {notifications.filter(n => n.userId === currentUser?.id).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Tudo tranquilo por aqui! 🍃</p>
                  ) : (
                    notifications.filter(n => n.userId === currentUser?.id).map(n => (
                      <div 
                        key={n.id} 
                        className={clsx("p-3 rounded-xl text-sm transition-colors cursor-pointer", n.read ? "bg-gray-50 text-gray-500" : "bg-joy-50 text-gray-800 border-l-4 border-joy-400")}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <p>{n.message}</p>
                        <span className="text-xs opacity-60">{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;