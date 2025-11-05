'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage, t } = useSettingsStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  const [apiKeysMenuOpen, setApiKeysMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto expand user menu if on user-related pages
    if (pathname?.startsWith('/dashboard/users') || pathname?.startsWith('/dashboard/login-history')) {
      setUserMenuOpen(true);
    }
    // Auto expand content menu if on content-related pages
    if (pathname?.startsWith('/dashboard/content')) {
      setContentMenuOpen(true);
    }
    // Auto expand api keys menu if on api keys related pages
    if (pathname?.startsWith('/dashboard/api-keys')) {
      setApiKeysMenuOpen(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      name: t('dashboard.users'),
      path: '/dashboard/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        {
          name: 'Lịch sử đăng nhập',
          path: '/dashboard/login-history',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('dashboard.content'),
      path: '/dashboard/content',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        {
          name: 'Tạo Ideas',
          path: '/dashboard/content/ideas',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          ),
        },
        {
          name: 'Tạo Briefs',
          path: '/dashboard/content/briefs',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: 'Tạo Draft',
          path: '/dashboard/content/draft',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
      ],
    },
    {
      name: t('dashboard.apiKeys'),
      path: '/dashboard/api-keys',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        {
          name: 'Danh sách API Key',
          path: '/dashboard/api-keys/list',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: 'Lịch sử sử dụng API Key',
          path: '/dashboard/api-keys/history',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center mb-5 px-3">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Content Multiplier
            </h1>
          </div>

          {/* Navigation */}
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const hasActiveSubmenu = item.hasSubmenu && item.submenu?.some(sub => pathname === sub.path);
              
              return (
                <li key={item.path}>
                  {item.hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => {
                          if (item.path === '/dashboard/users') {
                            setUserMenuOpen(!userMenuOpen);
                          } else if (item.path === '/dashboard/content') {
                            setContentMenuOpen(!contentMenuOpen);
                          } else if (item.path === '/dashboard/api-keys') {
                            setApiKeysMenuOpen(!apiKeysMenuOpen);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          isActive || hasActiveSubmenu
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            (item.path === '/dashboard/users' && userMenuOpen) || 
                            (item.path === '/dashboard/content' && contentMenuOpen) ||
                            (item.path === '/dashboard/api-keys' && apiKeysMenuOpen)
                              ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Submenu */}
                      {((item.path === '/dashboard/users' && userMenuOpen) || 
                        (item.path === '/dashboard/content' && contentMenuOpen) ||
                        (item.path === '/dashboard/api-keys' && apiKeysMenuOpen)) && item.submenu && (
                        <ul className="ml-4 mt-2 space-y-1">
                          {item.path === '/dashboard/users' && (
                            <li>
                              <Link
                                href={item.path}
                                className={`flex items-center p-2 rounded-lg transition-colors text-sm ${
                                  pathname === item.path
                                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="ml-3">Danh sách người dùng</span>
                              </Link>
                            </li>
                          )}
                          {item.submenu.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                href={subItem.path}
                                className={`flex items-center p-2 rounded-lg transition-colors text-sm ${
                                  pathname === subItem.path
                                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                {subItem.icon}
                                <span className="ml-3">{subItem.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      className={`flex items-center p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
