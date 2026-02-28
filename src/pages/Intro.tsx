import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FINAL_TEXT = 'точка сборки';
const CHARS = '01#@%&∆≈<>';

export default function Intro() {
  const [displayText, setDisplayText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const frameRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: number;

    const animate = () => {
      frameRef.current++;
      const progress = frameRef.current / 40;

      if (progress >= 1) {
        setDisplayText(FINAL_TEXT);
        setRevealed(true);
        clearInterval(interval);
        return;
      }

      const newText = FINAL_TEXT.split('')
        .map((char) => {
          if (char === ' ') return ' ';
          return Math.random() < progress
            ? char
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      setDisplayText(newText);
    };

    interval = window.setInterval(animate, 50);

    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[#0B0F14] flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-yellow-400/10 to-transparent" />

      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-orange-500 rounded-full blur-3xl opacity-40"
        style={{ animation: 'float1 10s ease-in-out infinite' }}
      />

      <div
        className="absolute top-20 -right-40 w-[700px] h-[700px] bg-yellow-400 rounded-full blur-3xl opacity-30"
        style={{ animation: 'float2 12s ease-in-out infinite' }}
      />

      <div
        className="absolute bottom-0 left-40 w-[500px] h-[500px] bg-lime-400 rounded-full blur-3xl opacity-30"
        style={{ animation: 'float3 11s ease-in-out infinite' }}
      />

      <div
        className={`relative transition-all duration-700 ${
          revealed
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-80 blur-sm scale-105'
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-semibold tracking-[0.25em] text-white uppercase text-center drop-shadow-xl">
          {displayText}
        </h1>

        <div
          className={`transition-all duration-1000 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="mt-8 text-sm md:text-base tracking-[0.35em] text-white/70 uppercase text-center">
            Детский курорт Вита
          </p>

          <p className="mt-3 text-xs tracking-[0.3em] text-white/40 uppercase text-center">
            опыт · знания · прогресс
          </p>
        </div>
      </div>
    </div>
  );
}
