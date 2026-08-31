import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Award,
  Users,
  MoreHorizontal,
  Shield,
  Clock,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  X
} from 'lucide-react';

export default function MobileNavigation() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const userName = user.name || user.firstName || 'Abi';
  const rawRole = typeof user.role === 'string'
    ? user.role
    : typeof user.role === 'object' && user.role !== null && user.role.name
      ? user.role.name
      : 'ADMIN';
  const userRole = String(rawRole).toUpperCase();

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'departments', label: 'Departments', icon: Building2, path: '/admin/departments' },
    { id: 'designations', label: 'Designations', icon: Award, path: '/admin/designations' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employee' },
  ];

  const secondaryNav = [
    { id: 'roles', label: 'Roles', icon: Shield, path: '/admin/roles' },
    { id: 'attendance', label: 'Attendance', icon: Clock, path: '/admin/attendance' },
    { id: 'payroll', label: 'Payroll', icon: CreditCard, path: '/admin/payroll' },
    { id: 'notices', label: 'Notices', icon: Bell, path: '/admin/notices' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMoreOpen(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    setIsMoreOpen(false);
    navigate(path);
  };

  const isPathActive = (path) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin/dashboard' || location.pathname === '/dashboard')) return true;
    if (path === '/admin/departments' && (location.pathname === '/admin/departments' || location.pathname === '/departments')) return true;
    if (path === '/admin/designations' && (location.pathname === '/admin/designations' || location.pathname === '/designations')) return true;
    if (path === '/admin/employee' && (location.pathname === '/admin/employee' || location.pathname === '/employees')) return true;
    if (path === '/admin/roles' && (location.pathname === '/admin/roles' || location.pathname === '/roles')) return true;
    if (path === '/admin/attendance' && (location.pathname === '/admin/attendance' || location.pathname === '/attendance')) return true;
    if (path === '/admin/payroll' && (location.pathname === '/admin/payroll' || location.pathname === '/payroll')) return true;
    if (path === '/admin/notices' && (location.pathname === '/admin/notices' || location.pathname === '/notices')) return true;
    if (path === '/admin/settings' && (location.pathname === '/admin/settings' || location.pathname === '/settings')) return true;
    return location.pathname === path;
  };

  const isSecondaryActive = secondaryNav.some((item) => isPathActive(item.path));

  return (
    <>
      {/* Dark Overlay Backdrop */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* Slide-Up Drawer Menu */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-slate-900 text-white rounded-t-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMoreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drawer Header & Profile Card */}
        <div className="p-4 border-b border-slate-800 relative">
          <button
            onClick={() => setIsMoreOpen(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            aria-label="Close drawer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {getInitials(userName)}
              </div>
              <div>
                <h4 className="font-semibold text-white text-base leading-tight">{userName}</h4>
                <span className="text-xs bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700 font-medium inline-block mt-0.5">
                  {userRole}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-lg transition-colors border border-rose-500/30 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Secondary Links List */}
        <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto pb-24">
          <p className="text-xs font-semibold text-slate-400 px-3 pb-2 uppercase tracking-wider">
            Management & System
          </p>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left font-medium ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30 md:hidden px-2 py-1.5">
        <div className="flex items-center justify-around">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = isPathActive(item.path) && !isMoreOpen;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
                  isActive
                    ? 'text-blue-400 font-semibold bg-blue-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
              isMoreOpen || isSecondaryActive
                ? 'text-blue-400 font-semibold bg-blue-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={isMoreOpen || isSecondaryActive ? 2.5 : 1.75} />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
