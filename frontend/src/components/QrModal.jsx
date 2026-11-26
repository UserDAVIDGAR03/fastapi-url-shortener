import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function QrModal({ shortId, onClose }) {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const shortUrl = shortId ? `${API_BASE_URL}/${shortId}` : '';

  useEffect(() => {
    if (!shortId || !shortUrl) {
      setDownloadUrl('');
      setError('');
      setCopied(false);
      return;
    }

    let cancelled = false;

    const renderQr = async () => {
      setLoading(true);
      setError('');
      setDownloadUrl('');

      try {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('No se encontró el lienzo del código QR.');
        }

        await QRCode.toCanvas(canvas, shortUrl, {
          width: 208,
          margin: 2,
          color: {
            dark: '#09090b',
            light: '#ffffff',
          },
        });

        if (!cancelled) {
          setDownloadUrl(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'No se pudo generar el código QR.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    renderQr();

    return () => {
      cancelled = true;
    };
  }, [shortId, shortUrl]);

  useEffect(() => {
    if (!shortId) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortId, onClose]);

  if (!shortId) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('No se pudo copiar el enlace.');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#F7F6F2] text-zinc-900 border border-zinc-200 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-3.5 bg-white border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>CÓDIGO QR · /{shortId}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            aria-label="Cerrar modal de QR"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5 flex flex-col items-center justify-center min-h-[230px]">
            {loading && (
              <p className="font-mono text-xs text-zinc-400 mb-2">
                Generando código QR...
              </p>
            )}

            {error ? (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                {error}
              </p>
            ) : (
              <canvas
                ref={canvasRef}
                className={loading ? 'hidden' : 'block rounded-lg'}
              />
            )}
          </div>

          <div className="bg-white border border-zinc-200/90 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <span>ATAJO VINCULADO</span>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-sans normal-case text-xs font-medium"
              >
                <span>Abrir</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 truncate">
              {shortUrl}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-medium py-2.5 px-3 rounded-lg transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enlace copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>

            <a
              href={downloadUrl || '#'}
              download={`qr-${shortId}.png`}
              onClick={(e) => {
                if (!downloadUrl) e.preventDefault();
              }}
              className={`inline-flex items-center justify-center gap-2 text-xs font-medium py-2.5 px-3 rounded-lg transition ${
                downloadUrl
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PNG</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}