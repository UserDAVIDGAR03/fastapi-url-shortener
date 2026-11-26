import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function QrModal({ shortId, onClose }) {
  const qrWrapperRef = useRef(null);

  if (!shortId) return null;
  const fullUrl = `${API_BASE_URL}/${shortId}`;

  const handleDownload = () => {
    const canvas = qrWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `qr-${shortId}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xs w-full p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-100 font-mono">/{shortId}</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={qrWrapperRef} className="bg-white p-4 rounded-lg flex justify-center">
          <QRCodeCanvas value={fullUrl} size={180} level="H" />
        </div>

        <p className="text-xs text-zinc-400 text-center truncate font-mono">{fullUrl}</p>

        <button
          onClick={handleDownload}
          className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs py-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar PNG</span>
        </button>
      </div>
    </div>
  );
}