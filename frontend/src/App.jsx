import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ShortenerForm from './components/ShortenerForm';
import ResultCard from './components/ResultCard';
import StatsCards from './components/StatsCards';
import UrlHistoryTable from './components/UrlHistoryTable';
import QrModal from './components/QrModal';
import AnalyticsModal from './components/AnalyticsModal';
import AuthView from './components/AuthView';
import WelcomeView from './components/WelcomeView';
import {
  API_BASE_URL,
  getUrls,
  shortenUrl,
  toggleUrlStatus,
  deleteUrl,
} from './services/api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('fast_url_token'));
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem('fast_url_email') || ''
  );
  const [guestConfirmed, setGuestConfirmed] = useState(
    () =>
      !localStorage.getItem('fast_url_token') &&
      localStorage.getItem('fast_url_guest_mode') === 'true'
  );

  const [authOrigin, setAuthOrigin] = useState('welcome');

  const [screen, setScreen] = useState(() => {
    if (localStorage.getItem('fast_url_token')) return 'app';
    if (localStorage.getItem('fast_url_guest_mode') === 'true') return 'app';
    return 'welcome';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [urls, setUrls] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [latestUrl, setLatestUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [qrShortId, setQrShortId] = useState(null);
  const [analyticsShortId, setAnalyticsShortId] = useState(null);

  const isAuthenticated = Boolean(token);
  const isGuest = !isAuthenticated && guestConfirmed;
  const canAccessApp = isAuthenticated || isGuest;

  const handleLogout = useCallback(() => {
    localStorage.removeItem('fast_url_token');
    localStorage.removeItem('fast_url_email');
    localStorage.removeItem('fast_url_guest_mode');
    setToken(null);
    setUserEmail('');
    setGuestConfirmed(false);
    setUrls([]);
    setLatestUrl(null);
    setErrorMsg('');
    setActiveTab('home');
    setAuthOrigin('welcome');
    setScreen('welcome');
  }, []);

  useEffect(() => {
    if (screen === 'app' && !canAccessApp) {
      setScreen('welcome');
    }
  }, [screen, canAccessApp]);

  const fetchHistory = useCallback(async () => {
    if (screen !== 'app' || !canAccessApp) return;
    try {
      setLoadingList(true);
      const data = await getUrls();
      setUrls(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 401 && token) {
        handleLogout();
      }
    } finally {
      setLoadingList(false);
    }
  }, [screen, canAccessApp, token, handleLogout]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const navigateToAuth = (mode, fromScreen) => {
    setErrorMsg('');
    setAuthOrigin(fromScreen);
    setScreen(mode);
  };

  const handleBackFromAuth = () => {
    setErrorMsg('');
    if (authOrigin === 'app' && canAccessApp) {
      setScreen('app');
      return;
    }
    setScreen('welcome');
  };

  const handleStartGuest = () => {
    localStorage.removeItem('fast_url_token');
    localStorage.removeItem('fast_url_email');
    localStorage.setItem('fast_url_guest_mode', 'true');
    setToken(null);
    setUserEmail('');
    setGuestConfirmed(true);
    setLatestUrl(null);
    setErrorMsg('');
    setActiveTab('home');
    setScreen('app');
  };

  const handleAuthSuccess = (newToken, email) => {
    localStorage.setItem('fast_url_token', newToken);
    localStorage.setItem('fast_url_email', email);
    localStorage.removeItem('fast_url_guest_mode');
    setToken(newToken);
    setUserEmail(email);
    setGuestConfirmed(false);
    setLatestUrl(null);
    setErrorMsg('');
    setActiveTab('home');
    setScreen('app');
  };

  const handleCopy = async (shortId) => {
    const fullUrl = `${API_BASE_URL}/${shortId}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(shortId);
      setTimeout(
        () => setCopiedId((prev) => (prev === shortId ? null : prev)),
        1800
      );
    } catch {
      setErrorMsg('No se pudo copiar al portapapeles.');
    }
  };

  const handleShorten = async (originalUrl) => {
    if (!canAccessApp) {
      setScreen('welcome');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const created = await shortenUrl({ original_url: originalUrl });
      setLatestUrl(created);
      await fetchHistory();
      await handleCopy(created.short_id);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setErrorMsg(
        typeof detail === 'string'
          ? detail
          : 'No se pudo acortar la URL. Revisa el formato o inicia sesión si alcanzaste el límite de invitado.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (shortId) => {
    try {
      await toggleUrlStatus(shortId);
      await fetchHistory();
    } catch {
      setErrorMsg('No se pudo actualizar el estado del enlace.');
    }
  };

  const handleDelete = async (shortId) => {
    try {
      await deleteUrl(shortId);
      if (latestUrl?.short_id === shortId) setLatestUrl(null);
      await fetchHistory();
    } catch {
      setErrorMsg('No se pudo eliminar el enlace.');
    }
  };

  if (screen === 'welcome') {
    return (
      <WelcomeView
        onStartGuest={handleStartGuest}
        onGoLogin={() => navigateToAuth('login', 'welcome')}
        onGoRegister={() => navigateToAuth('register', 'welcome')}
      />
    );
  }

  if (screen === 'login' || screen === 'register') {
    return (
      <AuthView
        initialMode={screen}
        onBack={handleBackFromAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (!canAccessApp) {
    return (
      <WelcomeView
        onStartGuest={handleStartGuest}
        onGoLogin={() => navigateToAuth('login', 'welcome')}
        onGoRegister={() => navigateToAuth('register', 'welcome')}
      />
    );
  }

  const guestLimitReached = isGuest && urls.length >= 1;
  const displayedResult = latestUrl || urls[0] || null;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-zinc-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isGuest={isGuest}
        userEmail={userEmail}
        guestUsedCount={urls.length}
        onOpenAuth={() => navigateToAuth('login', 'app')}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {activeTab === 'home' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded">
                  ESPACIO DE TRABAJO
                </span>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                  Links largos,
                  <br />
                  atajos cortos.
                </h1>

                <p className="text-xs sm:text-sm text-zinc-600 max-w-md leading-relaxed">
                  Acorta una URL, copia el atajo al instante o descarga su código QR para compartirlo.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-2.5">
                <div className="bg-white border border-zinc-200/90 rounded-xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <ShortenerForm
                    onShorten={handleShorten}
                    submitting={submitting}
                    disabled={guestLimitReached}
                    guestLimitReached={guestLimitReached}
                    onOpenAuth={() => navigateToAuth('login', 'app')}
                  />

                  {displayedResult && (
                    <ResultCard
                      urlData={displayedResult}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      onOpenDetails={(shortId) => setAnalyticsShortId(shortId)}
                      onOpenQr={(shortId) => setQrShortId(shortId)}
                    />
                  )}
                </div>

                {errorMsg && (
                  <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl">
                    <span>{errorMsg}</span>
                    {isGuest && (
                      <button
                        type="button"
                        onClick={() => navigateToAuth('login', 'app')}
                        className="font-semibold underline shrink-0 cursor-pointer"
                      >
                        Iniciar sesión
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {urls.length > 0 && <StatsCards urls={urls} />}

            <UrlHistoryTable
              urls={urls}
              loading={loadingList}
              copiedId={copiedId}
              onCopy={handleCopy}
              onOpenQr={(shortId) => setQrShortId(shortId)}
              onOpenAnalytics={(shortId) => setAnalyticsShortId(shortId)}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onViewAll={() => setActiveTab('history')}
              compact
            />
          </>
        ) : (
          <div className="space-y-4">
            {urls.length > 0 && <StatsCards urls={urls} />}
            <UrlHistoryTable
              urls={urls}
              loading={loadingList}
              copiedId={copiedId}
              onCopy={handleCopy}
              onOpenQr={(shortId) => setQrShortId(shortId)}
              onOpenAnalytics={(shortId) => setAnalyticsShortId(shortId)}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      <QrModal shortId={qrShortId} onClose={() => setQrShortId(null)} />
      <AnalyticsModal
        shortId={analyticsShortId}
        onClose={() => setAnalyticsShortId(null)}
      />
    </div>
  );
}