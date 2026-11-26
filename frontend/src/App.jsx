import { useState, useEffect, useCallback } from 'react';
import { getUrls, API_BASE_URL, getOrCreateGuestId } from './services/api';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import AuthView from './components/AuthView';
import SignalWavesBg from './components/SignalWavesBg';
import StatsCards from './components/StatsCards';
import ShortenerForm from './components/ShortenerForm';
import ResultCard from './components/ResultCard';
import UrlHistoryTable from './components/UrlHistoryTable';
import QrModal from './components/QrModal';
import AnalyticsModal from './components/AnalyticsModal';

function getInitialSession() {
  if (localStorage.getItem('fast_url_guest_mode') === 'true') {
    localStorage.removeItem('fast_url_token');
    localStorage.removeItem('fast_url_email');
    getOrCreateGuestId();
    return { token: null, email: '', isGuest: true };
  }

  const token = localStorage.getItem('fast_url_token');
  const email = localStorage.getItem('fast_url_email');
  if (token) {
    return { token, email: email || '', isGuest: false };
  }

  return null;
}

export default function App() {
  const [session, setSession] = useState(getInitialSession);
  const [authScreen, setAuthScreen] = useState(null);
  const [urls, setUrls] = useState([]);
  const [latestUrl, setLatestUrl] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [qrShortId, setQrShortId] = useState(null);
  const [analyticsShortId, setAnalyticsShortId] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('fast_url_token');
    localStorage.removeItem('fast_url_email');
    localStorage.removeItem('fast_url_guest_mode');
    setSession(null);
    setAuthScreen(null);
    setUrls([]);
    setLatestUrl(null);
  }, []);

  const fetchUrls = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getUrls();
      setUrls(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        console.error('Error al cargar historial:', err);
      }
    } finally {
      setLoadingList(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (!session) {
      setUrls([]);
      return;
    }
    if (session.token || session.isGuest) {
      fetchUrls();
    }
  }, [session, fetchUrls]);

  const handleContinueAsGuest = () => {
    localStorage.removeItem('fast_url_token');
    localStorage.removeItem('fast_url_email');
    localStorage.setItem('fast_url_guest_mode', 'true');
    getOrCreateGuestId();

    setAuthScreen(null);
    setLatestUrl(null);
    setUrls([]);
    setSession({ token: null, email: '', isGuest: true });
  };

  const handleOpenRegisterFromGuest = () => {
    localStorage.removeItem('fast_url_guest_mode');
    setSession(null);
    setUrls([]);
    setLatestUrl(null);
    setAuthScreen('register');
  };

  if (!session) {
    if (!authScreen) {
      return (
        <WelcomeView
          onGetStarted={() => setAuthScreen('register')}
          onGoToLogin={() => setAuthScreen('login')}
          onContinueAsGuest={handleContinueAsGuest}
        />
      );
    }

    return (
      <AuthView
        key={authScreen}
        initialMode={authScreen}
        onAuthenticated={(authData) => {
          localStorage.removeItem('fast_url_guest_mode');
          setLatestUrl(null);
          setSession({
            token: authData.token,
            email: authData.email || '',
            isGuest: false,
          });
          setAuthScreen(null);
        }}
        onBackToWelcome={() => setAuthScreen(null)}
      />
    );
  }

  const handleUrlCreated = (newUrl) => {
    setLatestUrl(newUrl);
    fetchUrls();
  };

  const handleCopy = (shortId) => {
    navigator.clipboard.writeText(`${API_BASE_URL}/${shortId}`);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const guestLimitReached = Boolean(session.isGuest && urls.length >= 1);

  return (
    <div className="min-h-screen bg-[#EFECE6] text-stone-900 flex flex-col relative overflow-x-hidden">
      <SignalWavesBg />

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar
          userEmail={session.email}
          isGuest={session.isGuest}
          onLogout={handleLogout}
          onUpgradeAccount={handleOpenRegisterFromGuest}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 flex flex-col gap-7">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Acortar enlace
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                {session.isGuest
                  ? 'Estás usando el modo sin cuenta: puedes mantener 1 enlace activo a la vez.'
                  : 'Pega una URL larga y genera un enlace corto con alias o caducidad si lo necesitas.'}
              </p>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-xl p-5 sm:p-6 space-y-4">
              <ShortenerForm
                onUrlCreated={handleUrlCreated}
                guestLimitReached={guestLimitReached}
                onRegisterPrompt={handleOpenRegisterFromGuest}
              />
              <ResultCard
                urlData={latestUrl}
                copiedId={copiedId}
                onCopy={handleCopy}
                onRefresh={fetchUrls}
              />
            </div>

            <StatsCards urls={urls} />
          </div>

          <UrlHistoryTable
            urls={urls}
            loading={loadingList}
            copiedId={copiedId}
            onCopy={handleCopy}
            onRefresh={fetchUrls}
            onOpenQr={(id) => setQrShortId(id)}
            onOpenAnalytics={(id) => setAnalyticsShortId(id)}
          />
        </main>

        <footer className="border-t border-stone-200/80 bg-white/60 py-3.5 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-stone-400">
            <span>fast-url</span>
            <span>Gestión de enlaces y visitas</span>
          </div>
        </footer>
      </div>

      <QrModal shortId={qrShortId} onClose={() => setQrShortId(null)} />
      <AnalyticsModal shortId={analyticsShortId} onClose={() => setAnalyticsShortId(null)} />
    </div>
  );
}