import React from 'react';
import { Cloud, RefreshCw, CheckCircle2, AlertCircle, Settings, Globe, Sun, Moon } from 'lucide-react';
import { Language, SyncStatus } from '../types';
import { getTranslation } from '../i18n';

interface HeaderProps {
  language: Language;
  syncStatus: SyncStatus;
  isDark: boolean;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  syncStatus,
  isDark,
  onToggleLanguage,
  onToggleTheme,
  onOpenSettings,
  onSync
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 pt-safe transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-black text-xl shadow-sm">
            ∑
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {t('appName')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Sync Status / Button */}
          <button
            onClick={onSync}
            disabled={syncStatus === 'syncing'}
            title={t('googleSync')}
            className="min-h-11 min-w-11 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition disabled:opacity-50"
          >
            {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />}
            {syncStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            {syncStatus === 'conflict' && <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            {syncStatus === 'idle' && <Cloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
            <span className="hidden md:inline">
              {syncStatus === 'syncing' ? t('syncing') : 'Sync'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="min-h-11 min-w-11 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition flex items-center justify-center"
            title={t('themeLabel')}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="min-h-11 min-w-11 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            title={t('languageLabel')}
          >
            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="min-h-11 min-w-11 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition flex items-center justify-center"
            title={t('settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
