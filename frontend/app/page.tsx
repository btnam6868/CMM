'use client';

import { useSettingsStore } from '@/store/settingsStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import Link from 'next/link';

export default function Home() {
  const { t } = useSettingsStore();

  return (
    <>
      {/* Header with language and theme switchers */}
      <header className="fixed top-0 right-0 p-4 flex gap-3 z-50">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {t('auth.login')}
            </Link>
            <Link 
              href="/register"
              className="bg-gray-600 dark:bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
