import { useState, useEffect, useCallback } from 'react';
import { AppData, Deck, Flashcard, GitHubConfig, Language, SyncStatus, Theme } from './types';
import { loadAppData, saveAppData, loadGitHubConfig, saveGitHubConfig, loadLanguage, saveLanguage, loadTheme, saveTheme } from './services/storage';
import { pullFromGitHub, pushToGitHub, SyncConflictError } from './services/github-sync';
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

  // Initialize app state from IndexedDB
  useEffect(() => {
    async function init() {
      const [savedData, savedConfig, savedLang, savedTheme] = await Promise.all([
        loadAppData(),
        loadGitHubConfig(),
        loadLanguage(),
        loadTheme()
      ]);

      if (savedData && savedData.decks && savedData.decks.length > 0) {
        setData(savedData);
      } else {
        // First-time launch: initialize with the standard 2022 elementary curriculum
        const initial = seedData as unknown as AppData;
        await saveAppData(initial);
        setData(initial);
      }

      if (savedConfig) {
        setGithubConfig(savedConfig);
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

  // Cloud Pull
  const handlePull = useCallback(async () => {
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
  }, [githubConfig, t]);

  // Cloud Push
  const handlePush = useCallback(async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo || !data) {
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
  }, [githubConfig, data, t]);

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
        syncStatus={syncStatus}
        syncMessage={syncMessage}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={handleSaveConfig}
        onPush={handlePush}
        onPull={handlePull}
        onImportCurriculum={handleImportCurriculum}
        onSetLanguage={handleSetLanguage}
        onSetTheme={handleSetTheme}
      />
    </div>
  );
}

export default App;
