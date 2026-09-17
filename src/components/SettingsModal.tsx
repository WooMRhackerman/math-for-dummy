import React, { useState } from 'react';
import { 
  X, Key, UploadCloud, DownloadCloud, BookOpen, Check, AlertTriangle, 
  Sun, Moon, Monitor, ChevronDown, ChevronUp, LogOut, FileDown, FileUp, Database
} from 'lucide-react';
import { GitHubConfig, GoogleDriveConfig, Language, SyncProviderType, SyncStatus, Theme } from '../types';
import { getTranslation } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  language: Language;
  theme: Theme;
  config: GitHubConfig;
  googleConfig: GoogleDriveConfig | null;
  activeProvider: SyncProviderType;
  syncStatus: SyncStatus;
  syncMessage: string;
  onClose: () => void;
  onSaveConfig: (config: GitHubConfig) => void;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onPush: () => void;
  onPull: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onImportCurriculum: () => void;
  onSetLanguage: (lang: Language) => void;
  onSetTheme: (theme: Theme) => void;
  onSetProvider: (provider: SyncProviderType) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  language,
  theme,
  config,
  googleConfig,
  activeProvider,
  syncStatus,
  syncMessage,
  onClose,
  onSaveConfig,
  onConnectGoogle,
  onDisconnectGoogle,
  onPush,
  onPull,
  onExportJSON,
  onImportJSON,
  onImportCurriculum,
  onSetLanguage,
  onSetTheme,
  onSetProvider
}) => {
  const [token, setToken] = useState(config.token);
  const [owner, setOwner] = useState(config.owner);
  const [repo, setRepo] = useState(config.repo);
  const [path, setPath] = useState(config.path || 'data.json');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const isGoogleConnected = !!(googleConfig && Date.now() < googleConfig.expiresAt);

  const handleSaveGitHub = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      token: token.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      path: path.trim() || 'data.json',
      lastKnownSha: config.lastKnownSha
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert */}
          {syncMessage && (
            <div
              className={`p-3 rounded-xl text-sm flex items-start gap-2.5 ${
                syncStatus === 'conflict' || syncStatus === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* 🌟 1. Primary Cloud Sync: Google Drive */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('googleSync')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t('googleSyncDesc')}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 ${
                isGoogleConnected 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {isGoogleConnected ? '연결됨' : '미연결'}
              </span>
            </div>

            {isGoogleConnected ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {googleConfig?.userInfo?.picture ? (
                      <img 
                        src={googleConfig.userInfo.picture} 
                        alt="Google avatar" 
                        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-600 shrink-0" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {googleConfig?.userInfo?.name?.[0] || 'G'}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {googleConfig?.userInfo?.name || 'Google User'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {googleConfig?.userInfo?.email || ''}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onDisconnectGoogle}
                    className="min-h-9 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition flex items-center gap-1 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('disconnect')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onPush}
                    disabled={syncStatus === 'syncing'}
                    className="min-h-10 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {t('pushCloud')}
                  </button>

                  <button
                    type="button"
                    onClick={onPull}
                    disabled={syncStatus === 'syncing'}
                    className="min-h-10 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    {t('pullCloud')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onConnectGoogle}
                disabled={syncStatus === 'syncing'}
                className="w-full min-h-12 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{t('signInWithGoogle')}</span>
              </button>
            )}
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('themeLabel')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSetTheme('light')}
                className={`min-h-11 py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t('themeLight')}</span>
              </button>
              <button
                type="button"
                onClick={() => onSetTheme('dark')}
                className={`min-h-11 py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t('themeDark')}</span>
              </button>
              <button
                type="button"
                onClick={() => onSetTheme('system')}
                className={`min-h-11 py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                  theme === 'system'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>{t('themeSystem')}</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('languageLabel')}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetLanguage('ko')}
                className={`flex-1 min-h-11 py-2 rounded-lg text-sm font-semibold border transition ${
                  language === 'ko'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                한국어 (Korean)
              </button>
              <button
                type="button"
                onClick={() => onSetLanguage('en')}
                className={`flex-1 min-h-11 py-2 rounded-lg text-sm font-semibold border transition ${
                  language === 'en'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Curriculum Data Re-import */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Curriculum Data
            </h3>
            <button
              type="button"
              onClick={onImportCurriculum}
              className="w-full min-h-11 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t('importCurriculum')}
            </button>
          </div>

          {/* ⚙️ Collapsible Advanced Settings (GitHub PAT & Local JSON Backup) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <span>{t('advancedSettings')}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="space-y-6 pt-3 animate-fade-in">
                {/* Local JSON Backup / Restore */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    {t('localBackup')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onExportJSON}
                      className="min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      {t('exportJson')}
                    </button>

                    <label className="min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{t('importJson')}</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Legacy GitHub Sync Config */}
                <form onSubmit={handleSaveGitHub} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {t('githubSync')}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onSetProvider('github')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeProvider === 'github'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {activeProvider === 'github' ? '기본 활성화됨' : '선택'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tokenLabel')}
                    </label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="github_pat_..."
                      className="w-full min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      {t('tokenHelp')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        GitHub ID (Owner)
                      </label>
                      <input
                        type="text"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder="username"
                        className="w-full min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Repo Name
                      </label>
                      <input
                        type="text"
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        placeholder="math-study-data"
                        className="w-full min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('pathLabel')}
                    </label>
                    <input
                      type="text"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder="data.json"
                      className="w-full min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-10 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    {savedSuccess ? 'Saved!' : t('saveSettings')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
