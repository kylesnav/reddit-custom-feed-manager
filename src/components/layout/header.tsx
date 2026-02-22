'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { formatNumber } from '@/utils/format';

export function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-reddit-gray-200 dark:border-reddit-gray-700 bg-white dark:bg-reddit-gray-900">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-reddit-orange">
            Reddit Custom Feed Manager
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                {user.link_karma !== undefined && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatNumber(user.link_karma + (user.comment_karma || 0))} karma
                  </p>
                )}
              </div>
              {user.icon_img || user.snoovatar_img ? (
                <img
                  src={user.snoovatar_img || user.icon_img}
                  alt={user.name}
                  className="w-8 h-8 rounded-full bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 rounded-full bg-reddit-gray-300 dark:bg-reddit-gray-600 flex items-center justify-center ${user.icon_img || user.snoovatar_img ? 'hidden' : ''}`}>
                <User className="w-4 h-4" />
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-red-500 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}