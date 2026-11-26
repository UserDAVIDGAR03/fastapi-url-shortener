export default function GreenBubblesBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      <style>{`
        @keyframes bubbleFloatA {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) scale(0.95);
            opacity: 0.14;
          }
          50% {
            transform: translate3d(65px, -55px, 0px) scale(1.12);
            opacity: 0.32;
          }
        }
        @keyframes bubbleFloatB {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) scale(1.05);
            opacity: 0.12;
          }
          50% {
            transform: translate3d(-75px, 45px, 0px) scale(0.9);
            opacity: 0.28;
          }
        }
        @keyframes bubbleFloatC {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) scale(0.9);
            opacity: 0.16;
          }
          50% {
            transform: translate3d(40px, 60px, 0px) scale(1.15);
            opacity: 0.26;
          }
        }
        .bubble-a {
          animation: bubbleFloatA 14s ease-in-out infinite;
        }
        .bubble-b {
          animation: bubbleFloatB 18s ease-in-out infinite;
        }
        .bubble-c {
          animation: bubbleFloatC 16s ease-in-out infinite;
        }
      `}</style>

      {/* Burbuja verde superior izquierda */}
      <div
        className="bubble-a absolute -top-20 -left-16 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.34) 0%, rgba(5,150,105,0.10) 55%, rgba(0,0,0,0) 75%)',
        }}
      />

      {/* Burbuja verde central/derecha */}
      <div
        className="bubble-b absolute top-1/3 -right-20 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(52,211,153,0.26) 0%, rgba(16,185,129,0.08) 60%, rgba(0,0,0,0) 78%)',
        }}
      />

      {/* Burbuja verde inferior */}
      <div
        className="bubble-c absolute -bottom-24 left-1/3 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.28) 0%, rgba(4,120,87,0.08) 58%, rgba(0,0,0,0) 78%)',
        }}
      />

      {/* Burbuja pequeña flotante */}
      <div
        className="bubble-a absolute top-2/3 left-12 w-44 h-44 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(110,231,183,0.22) 0%, rgba(16,185,129,0.05) 65%, rgba(0,0,0,0) 80%)',
        }}
      />
    </div>
  );
}