import React, { useState } from 'react';
import { 
  X, Key, UploadCloud, DownloadCloud, BookOpen, Check, AlertTriangle, 
  Sun, Moon, Monitor, ChevronDown, ChevronUp, FileDown, FileUp, Database,
  HelpCircle, ExternalLink, FolderSync, HardDrive, RefreshCw, PlusCircle,
  Cloud, LogIn, UserPlus, LogOut
} from 'lucide-react';
import { GitHubConfig, GoogleDriveConfig, Language, SupabaseUser, SyncProviderType, SyncStatus, Theme } from '../types';
import { getTranslation } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  language: Language;
  theme: Theme;
  config: GitHubConfig;
  googleConfig: GoogleDriveConfig | null;
  googleClientId: string;
  supabaseUser: SupabaseUser | null;
  activeProvider: SyncProviderType;
  isCloudFileSupported: boolean;
  connectedFileName: string;
  syncStatus: SyncStatus;
  syncMessage: string;
  onClose: () => void;
  onConnectCloudFile: () => void;
  onCreateCloudFile: () => void;
  onDisconnectCloudFile: () => void;
  onReloadCloudFile: () => void;
  onSaveToCloudFile: () => void;
  onSaveConfig: (config: GitHubConfig) => void;
  onSaveGoogleClientId: (clientId: string) => void;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onSignInSupabase: (email: string, pass: string) => Promise<void>;
  onSignUpSupabase: (email: string, pass: string) => Promise<void>;
  onSignOutSupabase: () => Promise<void>;
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
  googleClientId,
  supabaseUser,
  activeProvider,
  isCloudFileSupported,
  connectedFileName,
  syncStatus,
  syncMessage,
  onClose,
  onConnectCloudFile,
  onCreateCloudFile,
  onDisconnectCloudFile,
  onReloadCloudFile,
  onSaveToCloudFile,
  onSaveConfig,
  onSaveGoogleClientId,
  onConnectGoogle,
  onDisconnectGoogle,
  onSignInSupabase,
  onSignUpSupabase,
  onSignOutSupabase,
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

  // Supabase Auth State
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [supabaseAuthMode, setSupabaseAuthMode] = useState<'signin' | 'signup'>('signin');
  const [supabaseAuthLoading, setSupabaseAuthLoading] = useState(false);
  const [supabaseAuthError, setSupabaseAuthError] = useState('');
  const [supabaseAuthSuccess, setSupabaseAuthSuccess] = useState('');

  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [savedClientIdSuccess, setSavedClientIdSuccess] = useState(false);
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  if (!isOpen) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const isGoogleConnected = !!(googleConfig && Date.now() < googleConfig.expiresAt);
  const isFileConnected = activeProvider === 'cloud-file' && !!connectedFileName;

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseEmail.trim() || !supabasePassword.trim()) {
      setSupabaseAuthError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setSupabaseAuthLoading(true);
    setSupabaseAuthError('');
    setSupabaseAuthSuccess('');

    try {
      if (supabaseAuthMode === 'signup') {
        await onSignUpSupabase(supabaseEmail.trim(), supabasePassword.trim());
        setSupabaseAuthSuccess('가입이 완료되었습니다! 로그인되었습니다.');
      } else {
        await onSignInSupabase(supabaseEmail.trim(), supabasePassword.trim());
        setSupabaseAuthSuccess('로그인되었습니다.');
      }
      setSupabasePassword('');
    } catch (err: unknown) {
      setSupabaseAuthError(err instanceof Error ? err.message : '인증 실패');
    } finally {
      setSupabaseAuthLoading(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoogleClientId(clientIdInput.trim());
    setSavedClientIdSuccess(true);
    setTimeout(() => setSavedClientIdSuccess(false), 2000);
  };

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

          {/* 🌟 1. Primary: Supabase Real-time Web Cloud Sync */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-blue-50/40 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-blue-950/20 p-4 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('supabaseSyncTitle')}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {t('supabaseSyncDesc')}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 ${
                supabaseUser 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {supabaseUser ? '연동됨' : '미연결'}
              </span>
            </div>

            {supabaseUser ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-sm border border-emerald-300 dark:border-emerald-700">
                      {supabaseUser.email ? supabaseUser.email[0].toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {supabaseUser.email}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t('supabaseConnected')}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onSignOutSupabase}
                    className="min-h-9 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('signOut')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onPush}
                    disabled={syncStatus === 'syncing'}
                    className="min-h-10 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>지금 동기화 (Push)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onPull}
                    disabled={syncStatus === 'syncing'}
                    className="min-h-10 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>불러오기 (Pull)</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSupabaseSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                {supabaseAuthError && (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{supabaseAuthError}</span>
                  </div>
                )}
                {supabaseAuthSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{supabaseAuthSuccess}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={supabaseEmail}
                      onChange={(e) => setSupabaseEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full min-h-10 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('passwordLabel')} (6자 이상)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={supabasePassword}
                      onChange={(e) => setSupabasePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-10 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    onClick={() => setSupabaseAuthMode('signin')}
                    disabled={supabaseAuthLoading}
                    className="flex-1 min-h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{supabaseAuthLoading && supabaseAuthMode === 'signin' ? '로그인 중...' : t('signIn')}</span>
                  </button>

                  <button
                    type="submit"
                    onClick={() => setSupabaseAuthMode('signup')}
                    disabled={supabaseAuthLoading}
                    className="flex-1 min-h-11 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{supabaseAuthLoading && supabaseAuthMode === 'signup' ? '가입 중...' : t('signUp')}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-normal">
                  ✨ 한 번 로그인하면 이 기기에서 실시간으로 학습 진도가 자동 보관됩니다.
                </p>
              </form>
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

          {/* ⚙️ Collapsible Advanced Settings (Local JSON Backup, Google OAuth, GitHub PAT) */}
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

                {/* Optional Google OAuth Client ID config (Advanced) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      Google Drive 웹 연동 (OAuth 2.0)
                    </h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isGoogleConnected
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {isGoogleConnected ? '연결됨' : '미연결'}
                    </span>
                  </div>

                  {isGoogleConnected ? (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {googleConfig?.userInfo?.email || 'Google 계정 연결됨'}
                      </div>
                      <button
                        type="button"
                        onClick={onDisconnectGoogle}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        연동 해제
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onConnectGoogle}
                      className="w-full min-h-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      Google 계정 연결 시도
                    </button>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        OAuth Client ID
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGoogleGuide(!showGoogleGuide)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        {t('googleSetupGuide')}
                      </button>
                    </div>

                    {showGoogleGuide && (
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                        <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Google Cloud Console 클라이언트 ID 설정:
                        </div>
                        <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                          <li><a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Cloud Console</a>에서 프로젝트 생성</li>
                          <li>Google Drive API 사용 설정</li>
                          <li>OAuth 클라이언트 ID (웹 애플리케이션) 생성 후 아래 입력창에 저장</li>
                        </ol>
                      </div>
                    )}

                    <form onSubmit={handleSaveClientId} className="flex gap-2">
                      <input
                        type="text"
                        value={clientIdInput}
                        onChange={(e) => setClientIdInput(e.target.value)}
                        placeholder="xxxx.apps.googleusercontent.com"
                        className="flex-1 min-h-9 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="min-h-9 px-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        {savedClientIdSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                        {savedClientIdSuccess ? '저장됨' : '저장'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Local Google Drive / OneDrive Folder Direct File Sync (Windows Explorer) */}
                {isCloudFileSupported && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <FolderSync className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        내 컴퓨터 로컬 폴더 직접 연동 (파일 탐색기)
                      </h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isFileConnected
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {isFileConnected ? '연결됨' : '미연결'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      컴퓨터에 설치된 Google Drive(G: 드라이브) 또는 OneDrive 동기화 폴더의 파일을 직접 연결할 수 있습니다.
                    </p>

                    {isFileConnected ? (
                      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {connectedFileName}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={onReloadCloudFile}
                            className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            새로고침
                          </button>
                          <button
                            type="button"
                            onClick={onSaveToCloudFile}
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={onDisconnectCloudFile}
                            className="text-[11px] font-bold text-rose-600 hover:underline"
                          >
                            해제
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={onConnectCloudFile}
                          className="flex-1 min-h-9 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                          기존 파일 열기
                        </button>
                        <button
                          type="button"
                          onClick={onCreateCloudFile}
                          className="flex-1 min-h-9 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                          새 파일 생성
                        </button>
                      </div>
                    )}
                  </div>
                )}

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

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 min-h-10 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
                    >
                      {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                      {savedSuccess ? 'Saved!' : t('saveSettings')}
                    </button>
                    {activeProvider === 'github' && (
                      <>
                        <button
                          type="button"
                          onClick={onPush}
                          className="min-h-10 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          Push
                        </button>
                        <button
                          type="button"
                          onClick={onPull}
                          className="min-h-10 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          Pull
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
