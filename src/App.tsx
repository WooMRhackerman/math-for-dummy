import { useState, useEffect, useCallback } from 'react';
import { AppData, Deck, Flashcard, GitHubConfig, GoogleDriveConfig, Language, SupabaseUser, SyncProviderType, SyncStatus, Theme } from './types';
import { 
  loadAppData, saveAppData, loadGitHubConfig, saveGitHubConfig, 
  loadGoogleConfig, saveGoogleConfig, clearGoogleConfig,
  loadGoogleClientId, saveGoogleClientId,
  loadActiveSyncProvider, saveActiveSyncProvider,
  loadLanguage, saveLanguage, loadTheme, saveTheme 
} from './services/storage';
import { pullFromGitHub, pushToGitHub, SyncConflictError } from './services/github-sync';
import { 
  requestGoogleAccessToken, fetchGoogleUserInfo, 
  pullFromGoogleDrive, pushToGoogleDrive,
  DEFAULT_GOOGLE_CLIENT_ID 
} from './services/google-drive-sync';
import {
  isFileSystemAccessSupported,
  loadCloudDriveFileHandle,
  clearCloudDriveFileHandle,
  loadCloudDriveFileName,
  pickCloudDriveFile,
  createCloudDriveFile,
  readDataFromFileHandle,
  writeDataToFileHandle
} from './services/cloud-drive-file';
import {
  getSupabaseUser,
  signInWithEmail,
  signUpWithEmail,
  signOutSupabase,
  pullFromSupabase,
  pushToSupabase,
  onSupabaseAuthStateChange
} from './services/supabase-sync';
import { SyncManager } from './services/sync-manager';
import { calculateNextReview, isCardDue } from './services/srs';
import seedData from './data/curriculum-seed.json';
import { Header } from './components/Header';
import { DeckList } from './components/DeckList';
import { StudyCard } from './components/StudyCard';
import { SettingsModal } from './components/SettingsModal';
import { getTranslation } from './i18n';
import { CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';

export function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [activeProvider, setActiveProvider] = useState<SyncProviderType>('supabase');
  const [cloudFileHandle, setCloudFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [connectedFileName, setConnectedFileName] = useState<string>('');
  const isCloudFileSupported = isFileSystemAccessSupported();
  const [googleConfig, setGoogleConfig] = useState<GoogleDriveConfig | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>(DEFAULT_GOOGLE_CLIENT_ID);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>({
    token: '',
    owner: '',
    repo: '',
    path: 'data.json'
  });
  const [language, setLanguage] = useState<Language>('ko');
  const [theme, setTheme] = useState<Theme>('system');
  const [isSystemDark, setIsSystemDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active study session state
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Calculate whether dark mode is currently active
  const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);

  // Synchronize .dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Listen to OS dark mode changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Listen to Supabase Auth state changes (auto-login when redirected from email confirmation)
  useEffect(() => {
    const sub = onSupabaseAuthStateChange(async (user) => {
      if (user) {
        setSupabaseUser(user);
        setActiveProvider('supabase');
        await saveActiveSyncProvider('supabase');
        // Clean URL hash after email verification redirect
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        try {
          const res = await pullFromSupabase();
          if (res && res.data) {
            setData(res.data);
            await saveAppData(res.data);
          }
        } catch {
          // Keep local if no remote data yet
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  // Initialize app state from IndexedDB
  useEffect(() => {
    async function init() {
      const [
        savedData, 
        savedConfig, 
        savedGoogle, 
        savedClientId, 
        savedHandle, 
        savedFileName, 
        savedProvider, 
        savedLang, 
        savedTheme,
        currentSupabaseUser
      ] = await Promise.all([
        loadAppData(),
        loadGitHubConfig(),
        loadGoogleConfig(),
        loadGoogleClientId(),
        loadCloudDriveFileHandle(),
        loadCloudDriveFileName(),
        loadActiveSyncProvider(),
        loadLanguage(),
        loadTheme(),
        getSupabaseUser()
      ]);

      if (savedData && savedData.decks && savedData.decks.length > 0) {
        setData(savedData);
      } else {
        // First-time launch: initialize with the standard 2022 elementary curriculum
        const initial = seedData as unknown as AppData;
        await saveAppData(initial);
        setData(initial);
      }

      if (currentSupabaseUser) {
        setSupabaseUser(currentSupabaseUser);
      }

      if (savedConfig) {
        setGithubConfig(savedConfig);
      }

      if (savedGoogle) {
        setGoogleConfig(savedGoogle);
      }

      if (savedClientId) {
        setGoogleClientId(savedClientId);
      } else {
        setGoogleClientId(DEFAULT_GOOGLE_CLIENT_ID);
      }

      if (savedProvider) {
        setActiveProvider(savedProvider);
      } else if (currentSupabaseUser) {
        setActiveProvider('supabase');
      } else if (savedGoogle) {
        setActiveProvider('google-drive');
      } else if (savedHandle) {
        setCloudFileHandle(savedHandle);
        setConnectedFileName(savedFileName || savedHandle.name);
        setActiveProvider('cloud-file');
      } else {
        setActiveProvider('supabase');
      }

      // If user is authenticated with Supabase and activeProvider is supabase, auto pull latest
      if (currentSupabaseUser && (savedProvider === 'supabase' || !savedProvider)) {
        try {
          const res = await pullFromSupabase();
          if (res && res.data) {
            setData(res.data);
            await saveAppData(res.data);
          }
        } catch {
          // Keep local if offline or no remote record yet
        }
      }

      if (savedLang) {
        setLanguage(savedLang);
      }

      if (savedTheme) {
        setTheme(savedTheme);
      }
    }

    init();
  }, []);

  // Language switcher
  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'ko' ? 'en' : 'ko';
    setLanguage(nextLang);
    saveLanguage(nextLang);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  // Theme switcher
  const handleToggleTheme = () => {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const syncManager = new SyncManager({
    provider: activeProvider,
    cloudFileHandle,
    cloudFileName: connectedFileName,
    googleConfig,
    githubConfig
  });

  // Cloud Drive File Handlers (Google Drive / OneDrive direct sync)
  const handleConnectCloudFile = async () => {
    try {
      setSyncStatus('syncing');
      setSyncMessage(t('cloudFileConnecting'));
      const { handle, data: fileData, fileName } = await pickCloudDriveFile();
      setCloudFileHandle(handle);
      setConnectedFileName(fileName);
      setData(fileData);
      await saveAppData(fileData);
      setActiveProvider('cloud-file');
      await saveActiveSyncProvider('cloud-file');
      setSyncStatus('success');
      setSyncMessage(t('cloudFileConnected'));
      setTimeout(() => setSyncStatus('idle'), 3500);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setSyncStatus('idle');
        return;
      }
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : t('syncError'));
    }
  };

  const handleCreateCloudFile = async () => {
    if (!data) return;
    try {
      setSyncStatus('syncing');
      setSyncMessage(t('cloudFileCreating'));
      const { handle, fileName } = await createCloudDriveFile(data);
      setCloudFileHandle(handle);
      setConnectedFileName(fileName);
      setActiveProvider('cloud-file');
      await saveActiveSyncProvider('cloud-file');
      setSyncStatus('success');
      setSyncMessage(t('cloudFileCreated'));
      setTimeout(() => setSyncStatus('idle'), 3500);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setSyncStatus('idle');
        return;
      }
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : t('syncError'));
    }
  };

  const handleDisconnectCloudFile = async () => {
    await clearCloudDriveFileHandle();
    setCloudFileHandle(null);
    setConnectedFileName('');
    setActiveProvider('local');
    await saveActiveSyncProvider('local');
    setSyncStatus('idle');
    setSyncMessage(t('cloudFileDisconnected'));
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleReloadCloudFile = async () => {
    if (!cloudFileHandle) return;
    try {
      setSyncStatus('syncing');
      setSyncMessage(t('syncing'));
      const fileData = await readDataFromFileHandle(cloudFileHandle);
      setData(fileData);
      await saveAppData(fileData);
      setSyncStatus('success');
      setSyncMessage(t('cloudFileReloaded'));
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: unknown) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : t('syncError'));
    }
  };

  const handleSaveToCloudFile = async () => {
    if (!cloudFileHandle || !data) return;
    try {
      setSyncStatus('syncing');
      setSyncMessage(t('syncing'));
      await writeDataToFileHandle(cloudFileHandle, data);
      setSyncStatus('success');
      setSyncMessage(t('cloudFileSaved'));
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: unknown) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : t('syncError'));
    }
  };

  const handleSaveGoogleClientId = async (clientId: string) => {
    setGoogleClientId(clientId);
    await saveGoogleClientId(clientId);
  };

  // Google Sign-In & Connect (Web popup auto-auth)
  const handleConnectGoogle = async () => {
    const activeId = googleClientId?.trim() || DEFAULT_GOOGLE_CLIENT_ID;
    if (!activeId) {
      setIsSettingsOpen(true);
      setSyncStatus('error');
      setSyncMessage('Google OAuth Client ID가 필요합니다.');
      return;
    }

    try {
      setSyncStatus('syncing');
      setSyncMessage('Google 계정 인증 중...');
      const tokenResult = await requestGoogleAccessToken(googleClientId);
      const userInfo = await fetchGoogleUserInfo(tokenResult.accessToken);

      const newGoogleConfig: GoogleDriveConfig = {
        accessToken: tokenResult.accessToken,
        expiresAt: tokenResult.expiresAt,
        userInfo
      };

      setGoogleConfig(newGoogleConfig);
      await saveGoogleConfig(newGoogleConfig);
      setActiveProvider('google-drive');
      await saveActiveSyncProvider('google-drive');

      // Attempt to pull existing data or push current data
      try {
        const pullRes = await pullFromGoogleDrive(newGoogleConfig);
        setData(pullRes.data);
        await saveAppData(pullRes.data);
        newGoogleConfig.fileId = pullRes.fileId;
        await saveGoogleConfig(newGoogleConfig);
        setSyncStatus('success');
        setSyncMessage(`Google 드라이브 동기화 완료 (${userInfo.name})`);
      } catch (pullErr: unknown) {
        // If file not found on drive, push local data
        if (data) {
          const pushRes = await pushToGoogleDrive(newGoogleConfig, data);
          newGoogleConfig.fileId = pushRes.fileId;
          await saveGoogleConfig(newGoogleConfig);
          setSyncStatus('success');
          setSyncMessage(`Google 드라이브에 학습 데이터 생성 완료 (${userInfo.name})`);
        }
      }
      setTimeout(() => setSyncStatus('idle'), 3500);
    } catch (err: unknown) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : 'Google 인증 실패');
    }
  };

  // Disconnect Google
  const handleDisconnectGoogle = async () => {
    setGoogleConfig(null);
    await clearGoogleConfig();
    setActiveProvider('local');
    await saveActiveSyncProvider('local');
    setSyncStatus('idle');
    setSyncMessage('Google 계정 연동이 해제되었습니다.');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  // Supabase Auth Handlers
  const handleSignInSupabase = async (email: string, pass: string) => {
    setSyncStatus('syncing');
    setSyncMessage(t('supabaseConnecting'));
    const { user } = await signInWithEmail(email, pass);
    const suUser: SupabaseUser = { id: user.id, email: user.email || '' };
    setSupabaseUser(suUser);
    setActiveProvider('supabase');
    await saveActiveSyncProvider('supabase');

    try {
      const res = await pullFromSupabase();
      setData(res.data);
      await saveAppData(res.data);
      setSyncStatus('success');
      setSyncMessage(`Supabase 클라우드 데이터 로드 완료 (${user.email})`);
    } catch {
      // If no remote record exists yet, push local data
      if (data) {
        try {
          await pushToSupabase(data);
          setSyncStatus('success');
          setSyncMessage(`Supabase 클라우드에 초기 데이터 저장 완료 (${user.email})`);
        } catch {
          setSyncStatus('idle');
        }
      } else {
        setSyncStatus('idle');
      }
    }
    setTimeout(() => setSyncStatus('idle'), 3500);
  };

  const handleSignUpSupabase = async (email: string, pass: string) => {
    setSyncStatus('syncing');
    setSyncMessage(t('supabaseConnecting'));
    const { user, session } = await signUpWithEmail(email, pass);
    if (user && session) {
      const suUser: SupabaseUser = { id: user.id, email: user.email || '' };
      setSupabaseUser(suUser);
      setActiveProvider('supabase');
      await saveActiveSyncProvider('supabase');
      if (data) {
        try {
          await pushToSupabase(data);
        } catch (e) {
          console.warn('Initial push to Supabase after signup:', e);
        }
      }
      setSyncStatus('success');
      setSyncMessage(`회원가입 완료 및 클라우드 연동됨 (${user.email})`);
      setTimeout(() => setSyncStatus('idle'), 3500);
    } else if (user) {
      setSyncStatus('idle');
      setSyncMessage('이메일 확인 메일이 발송되었습니다. 인증 후 로그인해주세요.');
    }
  };

  const handleSignOutSupabase = async () => {
    await signOutSupabase();
    setSupabaseUser(null);
    setSyncStatus('idle');
    setSyncMessage(t('supabaseDisconnected'));
    setTimeout(() => setSyncMessage(''), 3000);
  };

  // Export JSON file backup
  const handleExportJSON = () => {
    if (!data) return;
    syncManager.exportAsJSON(data);
  };

  // Import JSON file backup
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed: AppData = JSON.parse(text);
        if (!parsed.decks || !Array.isArray(parsed.decks)) {
          throw new Error('올바른 데이터 형식이 아닙니다.');
        }
        setData(parsed);
        await saveAppData(parsed);
        setSyncStatus('success');
        setSyncMessage('JSON 백업 데이터를 성공적으로 복원했습니다.');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        setSyncStatus('error');
        setSyncMessage('JSON 파일 복원 실패: ' + (err instanceof Error ? err.message : '잘못된 파일'));
      }
    };
    reader.readAsText(file);
  };

  // Switch Active Provider
  const handleSetProvider = async (provider: SyncProviderType) => {
    setActiveProvider(provider);
    await saveActiveSyncProvider(provider);
  };

  // Cloud Pull
  const handlePull = useCallback(async () => {
    if (activeProvider === 'supabase') {
      if (!supabaseUser) {
        setIsSettingsOpen(true);
        return;
      }
      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        const res = await pullFromSupabase();
        setData(res.data);
        await saveAppData(res.data);
        setSyncStatus('success');
        setSyncMessage(t('syncSuccess'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        setSyncMessage(err instanceof Error ? err.message : t('syncError'));
      }
      return;
    }

    if (activeProvider === 'cloud-file') {
      if (!cloudFileHandle) {
        setIsSettingsOpen(true);
        return;
      }
      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        const fileData = await readDataFromFileHandle(cloudFileHandle);
        setData(fileData);
        await saveAppData(fileData);
        setSyncStatus('success');
        setSyncMessage(t('cloudFileReloaded'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        setSyncMessage(err instanceof Error ? err.message : t('syncError'));
      }
      return;
    }

    if (activeProvider === 'google-drive') {
      if (!googleConfig || Date.now() > googleConfig.expiresAt) {
        await handleConnectGoogle();
        return;
      }

      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        const res = await pullFromGoogleDrive(googleConfig);
        setData(res.data);
        await saveAppData(res.data);
        if (res.fileId) {
          const updated = { ...googleConfig, fileId: res.fileId };
          setGoogleConfig(updated);
          await saveGoogleConfig(updated);
        }
        setSyncStatus('success');
        setSyncMessage(t('syncSuccess'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        setSyncMessage(err instanceof Error ? err.message : t('syncError'));
      }
      return;
    }

    if (activeProvider === 'github') {
      if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
        setIsSettingsOpen(true);
        return;
      }

      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        const { data: remoteData, sha } = await pullFromGitHub(githubConfig);

        setData(remoteData);
        await saveAppData(remoteData);

        const updatedConfig = { ...githubConfig, lastKnownSha: sha };
        setGithubConfig(updatedConfig);
        await saveGitHubConfig(updatedConfig);

        setSyncStatus('success');
        setSyncMessage(t('syncSuccess'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        const msg = err instanceof Error ? err.message : String(err);
        setSyncMessage(msg === 'FILE_NOT_FOUND' ? 'GitHub에 파일이 없습니다. Push를 먼저 실행하세요.' : t('syncError'));
      }
    }
  }, [activeProvider, supabaseUser, cloudFileHandle, googleConfig, githubConfig, t]);

  // Cloud Push
  const handlePush = useCallback(async () => {
    if (!data) return;

    if (activeProvider === 'supabase') {
      if (!supabaseUser) {
        setIsSettingsOpen(true);
        return;
      }
      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        await pushToSupabase(data);
        setSyncStatus('success');
        setSyncMessage(t('syncSuccess'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        setSyncMessage(err instanceof Error ? err.message : t('syncError'));
      }
      return;
    }

    if (activeProvider === 'cloud-file') {
      if (!cloudFileHandle) {
        setIsSettingsOpen(true);
        return;
      }
      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        await writeDataToFileHandle(cloudFileHandle, data);
        setSyncStatus('success');
        setSyncMessage(t('cloudFileSaved'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        setSyncMessage(err instanceof Error ? err.message : t('syncError'));
      }
      return;
    }

    if (activeProvider === 'google-drive') {
      if (!googleConfig || Date.now() > googleConfig.expiresAt) {
        await handleConnectGoogle();
        return;
      }

      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        const res = await pushToGoogleDrive(googleConfig, data);
        const updated = { ...googleConfig, fileId: res.fileId };
        setGoogleConfig(updated);
        await saveGoogleConfig(updated);

        setSyncStatus('success');
        setSyncMessage(t('syncSuccess'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        setSyncStatus('error');
        setSyncMessage(err instanceof Error ? err.message : t('syncError'));
      }
      return;
    }

    if (activeProvider === 'github') {
      if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
        setIsSettingsOpen(true);
        return;
      }

      try {
        setSyncStatus('syncing');
        setSyncMessage(t('syncing'));
        const { sha } = await pushToGitHub(githubConfig, data);

        const updatedConfig = { ...githubConfig, lastKnownSha: sha };
        setGithubConfig(updatedConfig);
        await saveGitHubConfig(updatedConfig);

        setSyncStatus('success');
        setSyncMessage(t('syncSuccess'));
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof SyncConflictError) {
          setSyncStatus('conflict');
          setSyncMessage(t('syncConflict'));
        } else {
          setSyncStatus('error');
          setSyncMessage(t('syncError'));
        }
      }
    }
  }, [activeProvider, supabaseUser, cloudFileHandle, googleConfig, githubConfig, data, t]);

  // Save Settings from modal
  const handleSaveConfig = async (newConfig: GitHubConfig) => {
    setGithubConfig(newConfig);
    await saveGitHubConfig(newConfig);
  };

  // Re-seed curriculum
  const handleImportCurriculum = async () => {
    const seeded = seedData as unknown as AppData;
    setData(seeded);
    await saveAppData(seeded);
    setSyncMessage(t('curriculumImported'));
    setTimeout(() => setSyncMessage(''), 3000);
  };

  // Start study session for a deck
  const handleStartStudy = (deck: Deck) => {
    setActiveDeck(deck);
    // Prioritize due cards first, else study all cards in deck
    const due = deck.cards.filter((c) => isCardDue(c));
    const targetCards = due.length > 0 ? due : deck.cards;

    setStudyCards(targetCards);
    setCurrentCardIndex(0);
    setIsSessionComplete(false);
  };

  // Handle rating a card
  const handleRateCard = async (rating: 1 | 2 | 3 | 4) => {
    if (!activeDeck || !data) return;

    const currentCard = studyCards[currentCardIndex];
    const updatedReview = calculateNextReview(currentCard.review, rating);

    // Update card in active study session and global state
    const updatedCards = activeDeck.cards.map((c) =>
      c.id === currentCard.id ? { ...c, review: updatedReview } : c
    );

    const updatedDeck: Deck = { ...activeDeck, cards: updatedCards };
    const updatedDecks = data.decks.map((d) => (d.id === activeDeck.id ? updatedDeck : d));
    const newData: AppData = { ...data, decks: updatedDecks };

    setData(newData);
    await saveAppData(newData);
    setActiveDeck(updatedDeck);

    // Real-time auto-save to Supabase if active
    if (activeProvider === 'supabase' && supabaseUser) {
      pushToSupabase(newData).catch((err) => {
        console.warn('Real-time Supabase auto-save failed:', err);
      });
    }

    // Real-time auto-save to Google Drive if active
    if (activeProvider === 'google-drive' && googleConfig && Date.now() < googleConfig.expiresAt) {
      pushToGoogleDrive(googleConfig, newData).catch((err) => {
        console.warn('Real-time Google Drive auto-save failed:', err);
      });
    }

    // Real-time auto-save to connected cloud drive file if active
    if (activeProvider === 'cloud-file' && cloudFileHandle) {
      writeDataToFileHandle(cloudFileHandle, newData).catch((err) => {
        console.warn('Real-time cloud file auto-save failed:', err);
      });
    }

    // Move to next card or complete
    if (currentCardIndex + 1 < studyCards.length) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  };

  const handleExitStudy = () => {
    setActiveDeck(null);
    setStudyCards([]);
    setCurrentCardIndex(0);
    setIsSessionComplete(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors">
      <Header
        language={language}
        syncStatus={syncStatus}
        isDark={isDark}
        onToggleLanguage={handleToggleLanguage}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSync={handlePush}
      />

      <main className="flex-1">
        {activeDeck ? (
          isSessionComplete ? (
            /* Study Complete View */
            <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('studyCompleted')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activeDeck.name[language] || activeDeck.name.ko}의 {studyCards.length}개 카드를 모두 학습했습니다.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => handleStartStudy(activeDeck)}
                  className="min-h-12 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 학습하기
                </button>
                <button
                  onClick={handleExitStudy}
                  className="min-h-12 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToDecks')}
                </button>
              </div>
            </div>
          ) : (
            /* Active Study Card View */
            <StudyCard
              card={studyCards[currentCardIndex]}
              currentIndex={currentCardIndex}
              totalCards={studyCards.length}
              language={language}
              onRate={handleRateCard}
              onExit={handleExitStudy}
            />
          )
        ) : (
          /* Decks List / Home View */
          <DeckList
            decks={data ? data.decks : []}
            language={language}
            onSelectDeck={handleStartStudy}
            onImportCurriculum={handleImportCurriculum}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        language={language}
        theme={theme}
        config={githubConfig}
        googleConfig={googleConfig}
        googleClientId={googleClientId}
        supabaseUser={supabaseUser}
        activeProvider={activeProvider}
        isCloudFileSupported={isCloudFileSupported}
        connectedFileName={connectedFileName}
        syncStatus={syncStatus}
        syncMessage={syncMessage}
        onClose={() => setIsSettingsOpen(false)}
        onConnectCloudFile={handleConnectCloudFile}
        onCreateCloudFile={handleCreateCloudFile}
        onDisconnectCloudFile={handleDisconnectCloudFile}
        onReloadCloudFile={handleReloadCloudFile}
        onSaveToCloudFile={handleSaveToCloudFile}
        onSaveConfig={handleSaveConfig}
        onSaveGoogleClientId={handleSaveGoogleClientId}
        onConnectGoogle={handleConnectGoogle}
        onDisconnectGoogle={handleDisconnectGoogle}
        onSignInSupabase={handleSignInSupabase}
        onSignUpSupabase={handleSignUpSupabase}
        onSignOutSupabase={handleSignOutSupabase}
        onPush={handlePush}
        onPull={handlePull}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onImportCurriculum={handleImportCurriculum}
        onSetLanguage={handleSetLanguage}
        onSetTheme={handleSetTheme}
        onSetProvider={handleSetProvider}
      />
    </div>
  );
}

export default App;
