import React, { useState } from 'react';
import { X, Key, UploadCloud, DownloadCloud, BookOpen, Check, AlertTriangle } from 'lucide-react';
import { GitHubConfig, Language, SyncStatus } from '../types';
import { getTranslation } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  language: Language;
  config: GitHubConfig;
  syncStatus: SyncStatus;
  syncMessage: string;
  onClose: () => void;
  onSaveConfig: (config: GitHubConfig) => void;
  onPush: () => void;
  onPull: () => void;
  onImportCurriculum: () => void;
  onSetLanguage: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  language,
  config,
  syncStatus,
  syncMessage,
  onClose,
  onSaveConfig,
  onPush,
  onPull,
  onImportCurriculum,
  onSetLanguage
}) => {
  const [token, setToken] = useState(config.token);
  const [owner, setOwner] = useState(config.owner);
  const [repo, setRepo] = useState(config.repo);
  const [path, setPath] = useState(config.path || 'data.json');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const handleSave = (e: React.FormEvent) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert if any */}
          {syncMessage && (
            <div
              className={`p-3 rounded-xl text-sm flex items-start gap-2.5 ${
                syncStatus === 'conflict' || syncStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* GitHub Config Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Key className="w-4 h-4 text-blue-600" />
              {t('githubSync')}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('tokenLabel')}
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full min-h-11 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                {t('tokenHelp')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub ID (Owner)
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="username"
                  className="w-full min-h-11 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Repo Name
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="math-study-data"
                  className="w-full min-h-11 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('pathLabel')}
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="data.json"
                className="w-full min-h-11 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-11 bg-slate-900 text-white font-semibold rounded-lg text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              {savedSuccess ? 'Saved!' : t('saveSettings')}
            </button>
          </form>

          {/* Sync Actions */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Cloud Operations
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onPush}
                disabled={!token || syncStatus === 'syncing'}
                className="min-h-11 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                {t('pushCloud')}
              </button>

              <button
                type="button"
                onClick={onPull}
                disabled={!token || syncStatus === 'syncing'}
                className="min-h-11 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4" />
                {t('pullCloud')}
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              {t('languageLabel')}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetLanguage('ko')}
                className={`flex-1 min-h-11 py-2 rounded-lg text-sm font-semibold border transition ${
                  language === 'ko'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Curriculum Reset / Import */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Curriculum Data
            </h3>
            <button
              type="button"
              onClick={onImportCurriculum}
              className="w-full min-h-11 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              {t('importCurriculum')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
