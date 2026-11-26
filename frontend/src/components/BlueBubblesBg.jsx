export default function BlueBubblesBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      <style>{`
        @keyframes blueDriftOne {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.45;
          }
          33% {
            transform: translate(110px, -80px) scale(1.2);
            opacity: 0.75;
          }
          66% {
            transform: translate(-50px, 60px) scale(0.9);
            opacity: 0.35;
          }
        }
        @keyframes blueDriftTwo {
          0%, 100% {
            transform: translate(0px, 0px) scale(1.1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-130px, 95px) scale(0.85);
            opacity: 0.7;
          }
        }
        @keyframes blueDriftThree {
          0%, 100% {
            transform: translate(0px, 0px) scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: translate(90px, -110px) scale(1.25);
            opacity: 0.25;
          }
        }
        .blue-orb-1 {
          animation: blueDriftOne 9s ease-in-out infinite;
        }
        .blue-orb-2 {
          animation: blueDriftTwo 11s ease-in-out infinite;
        }
        .blue-orb-3 {
          animation: blueDriftThree 10s ease-in-out infinite;
        }
      `}</style>

      {/* Burbuja azul grande superior izquierda */}
      <div
        className="blue-orb-1 absolute -top-16 -left-16 w-80 h-80 sm:w-[26rem] sm:h-[26rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(37,99,235,0.22) 55%, rgba(0,0,0,0) 75%)',
        }}
      />

      {/* Burbuja azul derecha */}
      <div
        className="blue-orb-2 absolute top-1/4 -right-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(56,189,248,0.48) 0%, rgba(29,78,216,0.2) 58%, rgba(0,0,0,0) 78%)',
        }}
      />

      {/* Burbuja azul inferior */}
      <div
        className="blue-orb-3 absolute -bottom-20 left-1/3 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(96,165,250,0.5) 0%, rgba(30,64,175,0.18) 60%, rgba(0,0,0,0) 78%)',
        }}
      />

      {/* Burbuja mediana flotante */}
      <div
        className="blue-orb-1 absolute bottom-1/4 left-12 w-48 h-48 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(125,211,252,0.4) 0%, rgba(59,130,246,0.12) 65%, rgba(0,0,0,0) 80%)',
        }}
      />
    </div>
  );
}