export default function SignalWavesBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      <style>{`
        @keyframes waveShiftSlow {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
            opacity: 0.35;
          }
          50% {
            transform: translateX(-48px) translateY(14px);
            opacity: 0.7;
          }
        }
        @keyframes waveShiftReverse {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateX(52px) translateY(-16px);
            opacity: 0.65;
          }
        }
        .signal-wave-1 {
          animation: waveShiftSlow 12s ease-in-out infinite;
        }
        .signal-wave-2 {
          animation: waveShiftReverse 15s ease-in-out infinite;
        }
      `}</style>

      <svg
        className="signal-wave-1 absolute -top-10 -left-16 w-[130%] h-[420px]"
        viewBox="0 0 1440 320"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0,192 C240,96 480,288 720,176 C960,64 1200,256 1440,144"
          stroke="#E5391B"
          strokeWidth="2"
          strokeDasharray="10 10"
        />
        <path
          d="M0,224 C280,140 520,300 800,190 C1060,90 1260,240 1440,170"
          stroke="#0F766E"
          strokeWidth="1.5"
        />
      </svg>

      <svg
        className="signal-wave-2 absolute bottom-0 -left-16 w-[130%] h-[440px]"
        viewBox="0 0 1440 320"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0,110 C320,230 620,40 940,165 C1180,255 1320,120 1440,150"
          stroke="#0F766E"
          strokeWidth="2"
        />
        <path
          d="M0,155 C300,265 640,85 960,200 C1190,280 1330,165 1440,190"
          stroke="#E5391B"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />
      </svg>
    </div>
  );
}