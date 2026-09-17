import React from 'react';
import { Cloud, RefreshCw, CheckCircle2, AlertCircle, Settings, Globe } from 'lucide-react';
import { Language, SyncStatus } from '../types';
import { getTranslation } from '../i18n';

interface HeaderProps {
  language: Language;
  syncStatus: SyncStatus;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  onSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  syncStatus,
  onToggleLanguage,
  onOpenSettings,
  onSync
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 pt-safe transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
            ∑
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {t('appName')}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Sync Status / Button */}
          <button
            onClick={onSync}
            disabled={syncStatus === 'syncing'}
            title={t('githubSync')}
            className="min-h-11 min-w-11 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-700 transition disabled:opacity-50"
          >
            {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
            {syncStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {syncStatus === 'conflict' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            {syncStatus === 'idle' && <Cloud className="w-4 h-4 text-slate-500" />}
            <span className="hidden md:inline">
              {syncStatus === 'syncing' ? t('syncing') : 'Sync'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="min-h-11 min-w-11 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-700 transition"
            title={t('languageLabel')}
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="min-h-11 min-w-11 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center justify-center"
            title={t('settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
