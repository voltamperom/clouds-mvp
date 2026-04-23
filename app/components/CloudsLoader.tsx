'use client'

import Image from 'next/image'

export default function CloudsLoader() {
  return (
    <main className="cloudsLoader">
      <div className="cloudsLoader__bg" />

      <div className="cloudsLoader__content">
        <div className="cloudsLoader__symbolStage">
          <div className="cloudsLoader__glow" />

          <div className="cloudsLoader__symbolReveal">
            <div className="cloudsLoader__symbolWrap">
              <Image
                src="/clouds-symbol.png"
                alt="Clouds"
                width={170}
                height={96}
                priority
                style={{
                  width: '170px',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </div>

          <div className="cloudsLoader__sweep" />
        </div>

        <div className="cloudsLoader__text">
          <div className="cloudsLoader__title">Loading Clouds</div>
          <div className="cloudsLoader__subtitle">Entering Season I</div>
        </div>

        <div className="cloudsLoader__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <style jsx>{`
        .cloudsLoader {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #050c1c 0%, #081224 100%);
          color: #eef4ff;
        }

        .cloudsLoader__bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 87, 59, 0.1), transparent 22%),
            radial-gradient(circle at 50% 32%, rgba(255, 120, 70, 0.14), transparent 34%),
            radial-gradient(circle at top, rgba(59, 130, 246, 0.09), transparent 38%);
          pointer-events: none;
        }

        .cloudsLoader__content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 320px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .cloudsLoader__symbolStage {
          position: relative;
          width: 190px;
          height: 110px;
          margin-bottom: 18px;
        }

        .cloudsLoader__glow {
          position: absolute;
          inset: 10px;
          background: radial-gradient(circle, rgba(255, 96, 72, 0.34) 0%, rgba(255, 96, 72, 0) 72%);
          filter: blur(24px);
          opacity: 0;
          animation: cloudsGlow 1.8s ease-in-out infinite;
        }

        .cloudsLoader__symbolReveal {
          position: absolute;
          inset: 0;
          overflow: hidden;
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          animation: cloudsReveal 1.15s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .cloudsLoader__symbolWrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cloudsLoader__sweep {
          position: absolute;
          top: -8%;
          left: -28%;
          width: 34%;
          height: 116%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 35%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0.05) 65%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-16deg);
          opacity: 0;
          animation: cloudsSweep 1.4s ease-out 0.4s forwards;
          pointer-events: none;
        }

        .cloudsLoader__text {
          text-align: center;
          margin-bottom: 14px;
        }

        .cloudsLoader__title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .cloudsLoader__subtitle {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(238, 244, 255, 0.66);
          letter-spacing: 0.02em;
        }

        .cloudsLoader__dots {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }

        .cloudsLoader__dots span {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ff8a50 0%, #ff4d4f 100%);
          opacity: 0.3;
          animation: cloudsDot 1.1s ease-in-out infinite;
        }

        .cloudsLoader__dots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .cloudsLoader__dots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes cloudsReveal {
          0% {
            opacity: 0;
            clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          }
          20% {
            opacity: 1;
          }
          55% {
            clip-path: polygon(0 0, 78% 0, 26% 100%, 0 100%);
          }
          100% {
            opacity: 1;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }

        @keyframes cloudsSweep {
          0% {
            opacity: 0;
            transform: translateX(0) skewX(-16deg);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(260px) skewX(-16deg);
          }
        }

        @keyframes cloudsGlow {
          0%,
          100% {
            opacity: 0.18;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.42;
            transform: scale(1.04);
          }
        }

        @keyframes cloudsDot {
          0%,
          100% {
            opacity: 0.28;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }
      `}</style>
    </main>
  )
}