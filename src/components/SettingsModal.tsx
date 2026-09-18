import React, { useState } from 'react';
import { 
  X, Key, UploadCloud, DownloadCloud, BookOpen, Check, AlertTriangle, 
  Sun, Moon, Monitor, ChevronDown, ChevronUp, FileDown, FileUp, Database,
  HelpCircle, ExternalLink, FolderSync, HardDrive, RefreshCw, PlusCircle
} from 'lucide-react';
import { GitHubConfig, GoogleDriveConfig, Language, SyncProviderType, SyncStatus, Theme } from '../types';
import { getTranslation } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  language: Language;
  theme: Theme;
  config: GitHubConfig;
  googleConfig: GoogleDriveConfig | null;
  googleClientId: string;
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

  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [savedClientIdSuccess, setSavedClientIdSuccess] = useState(false);
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  if (!isOpen) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const isGoogleConnected = !!(googleConfig && Date.now() < googleConfig.expiresAt);
  const isFileConnected = activeProvider === 'cloud-file' && !!connectedFileName;

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

          {/* 🌟 1. Primary: Google Drive / OneDrive Direct File Sync */}
          <div className="rounded-2xl border-2 border-blue-500/30 dark:border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderSync className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t('driveFileTitle')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {t('driveFileDesc')}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 ${
                isFileConnected 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {isFileConnected ? '연결됨' : '미연결'}
              </span>
            </div>

            {isCloudFileSupported ? (
              isFileConnected ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {connectedFileName}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {t('autoSavedActive')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onDisconnectCloudFile}
                      className="min-h-9 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition shrink-0"
                    >
                      {t('disconnectFile')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onSaveToCloudFile}
                      disabled={syncStatus === 'syncing'}
                      className="min-h-10 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>지금 저장 (Save)</span>
                    </button>

                    <button
                      type="button"
                      onClick={onReloadCloudFile}
                      disabled={syncStatus === 'syncing'}
                      className="min-h-10 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('reloadFromFile')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onConnectCloudFile}
                      className="min-h-12 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>{t('connectExistingFile')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onCreateCloudFile}
                      className="min-h-12 px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t('createNewFile')}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-normal">
                    💡 파일 탐색기에서 내 컴퓨터의 <strong>Google Drive(G: 드라이브)</strong> 또는 <strong>OneDrive</strong> 폴더를 선택하세요.
                  </p>
                </div>
              )
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t('browserNotSupportedTitle')}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {t('browserNotSupportedDesc')}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onExportJSON}
                    className="min-h-9 px-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-bold flex items-center justify-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {t('exportJson')}
                  </button>
                  <label className="min-h-9 px-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>{t('importJson')}</span>
                    <input type="file" accept=".json" onChange={handleFileInputChange} className="hidden" />
                  </label>
                </div>
              </div>
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
                      <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Google Cloud OAuth 2.0 Web Login
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowGoogleGuide(!showGoogleGuide)}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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
                      className="flex-1 min-h-10 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="min-h-10 px-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shrink-0 flex items-center gap-1"
                    >
                      {savedClientIdSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                      {savedClientIdSuccess ? '저장됨' : '저장'}
                    </button>
                  </form>

                  {isGoogleConnected ? (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        {googleConfig?.userInfo?.email} 연결됨
                      </span>
                      <button
                        type="button"
                        onClick={onDisconnectGoogle}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        연동 해제
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onConnectGoogle}
                      className="w-full min-h-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      {t('signInWithGoogle')}
                    </button>
                  )}
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
