'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Settings as SettingsIcon
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import Image from 'next/image';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { settings } = useSettings();

  // Get user from localStorage to check role
  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.role || '';
        } catch (e) {
          return '';
        }
      }
    }
    return '';
  };

  const isAdmin = getUserRole() === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, adminOnly: false },
    { href: '/projects', label: 'Projects', Icon: FolderKanban, adminOnly: false },
    { href: '/surveys', label: 'Surveys', Icon: ClipboardList, adminOnly: false },
    { href: '/repository', label: 'Documents', Icon: FolderOpen, adminOnly: false },
    { href: '/data-cleaning', label: 'Data Validation', Icon: ShieldCheck, adminOnly: false },
    { href: '/indicators', label: 'Indicators', Icon: TrendingUp, adminOnly: false },
    { href: '/reports', label: 'Reports', Icon: FileText, adminOnly: false },
    { href: '/users', label: 'Users', Icon: Users, adminOnly: true },
    { href: '/settings', label: 'Settings', Icon: SettingsIcon, adminOnly: true },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } text-white transition-all duration-300 flex flex-col`}
        style={{ backgroundColor: settings?.sidebar_color || '#1F2937' }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              {settings?.logo_url && (
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image
                    src={settings.logo_url}
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <h1 className="text-xl font-bold">
                {settings?.app_name || 'M&E System'}
              </h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                <IconComponent className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-left"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {settings?.app_name || 'M&E Data Intelligence System'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome!</span>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

