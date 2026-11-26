export default function FlowLinesBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      <style>{`
        @keyframes streamSlideRight {
          0% {
            transform: translateX(-35%);
            opacity: 0;
          }
          25% {
            opacity: 0.55;
          }
          75% {
            opacity: 0.45;
          }
          100% {
            transform: translateX(115%);
            opacity: 0;
          }
        }
        @keyframes streamSlideLeft {
          0% {
            transform: translateX(115%);
            opacity: 0;
          }
          30% {
            opacity: 0.4;
          }
          80% {
            opacity: 0.35;
          }
          100% {
            transform: translateX(-35%);
            opacity: 0;
          }
        }
        .stream-a {
          animation: streamSlideRight 11s linear infinite;
        }
        .stream-b {
          animation: streamSlideLeft 14s linear infinite;
        }
        .stream-c {
          animation: streamSlideRight 16s linear infinite 3s;
        }
      `}</style>

      <div
        className="stream-a absolute top-[18%] left-0 w-96 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.65) 50%, rgba(251,191,36,0) 100%)',
          boxShadow: '0 0 18px rgba(245,158,11,0.45)',
        }}
      />

      <div
        className="stream-b absolute top-[46%] left-0 w-[28rem] h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.45) 50%, rgba(56,189,248,0) 100%)',
          boxShadow: '0 0 16px rgba(56,189,248,0.35)',
        }}
      />

      <div
        className="stream-c absolute top-[74%] left-0 w-80 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(249,115,22,0) 0%, rgba(251,191,36,0.55) 50%, rgba(249,115,22,0) 100%)',
          boxShadow: '0 0 18px rgba(249,115,22,0.4)',
        }}
      />

      <div
        className="stream-a absolute top-[88%] left-0 w-72 h-[1px]"
        style={{
          animationDelay: '6s',
          background:
            'linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.5) 50%, rgba(251,191,36,0) 100%)',
        }}
      />
    </div>
  );
}