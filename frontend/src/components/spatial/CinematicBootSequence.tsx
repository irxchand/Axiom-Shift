import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { BookOpen, Sparkles, Flame, Clock, Bookmark, ArrowRight, Sun, Feather, Coffee } from 'lucide-react';

export const CinematicBootSequence: React.FC = () => {
  const { hasBooted, setHasBooted } = useUIStore();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLaunching, setIsLaunching] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset launch state when hasBooted turns false
  useEffect(() => {
    if (!hasBooted) {
      setIsLaunching(false);
    }
  }, [hasBooted]);

  const handleNavClick = (path: string) => {
    setHasBooted(true);
    navigate(path);
  };

  // Mouse Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2D Volumetric Light & Dust Motes Canvas
  useEffect(() => {
    if (hasBooted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate Floating Dust Particles
    const dustParticles = Array.from({ length: 75 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Warm Volumetric Sunbeam Ray from Top-Left Window
      const rayGradient = ctx.createLinearGradient(0, 0, width * 0.7, height * 0.8);
      rayGradient.addColorStop(0, 'rgba(238, 204, 150, 0.08)');
      rayGradient.addColorStop(0.5, 'rgba(201, 169, 110, 0.03)');
      rayGradient.addColorStop(1, 'rgba(10, 10, 11, 0)');

      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.6, 0);
      ctx.lineTo(width * 0.8, height);
      ctx.lineTo(0, height * 0.7);
      ctx.closePath();
      ctx.fill();

      // Render Floating Dust Particles Drifting in Light Beam
      dustParticles.forEach((p) => {
        p.x += p.speedX + mousePos.x * 0.1;
        p.y += p.speedY + mousePos.y * 0.1;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(238, 215, 175, ${p.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hasBooted, mousePos]);

  // Keyboard Launch Event Listener
  useEffect(() => {
    if (hasBooted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasBooted]);

  const handleStart = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setHasBooted(true);
    }, 600);
  };

  if (hasBooted) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0A0A0B] text-[#F5EBE0] select-none overflow-hidden font-sans">
      {/* Volumetric Light & Dust Motes Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Atmospheric Ambient Lighting & Lamp Glow */}
      <div
        className="absolute top-10 left-16 w-[550px] h-[550px] rounded-full bg-[#C9A96E]/12 blur-[170px] pointer-events-none transition-transform duration-1000"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      />
      <div
        className="absolute bottom-10 right-20 w-[600px] h-[600px] rounded-full bg-[#3D2C1E]/40 blur-[180px] pointer-events-none transition-transform duration-1000"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      />

      {/* Background Walnut Wood Surface Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(40,30,22,0.4)_0%,rgba(10,10,11,0.98)_75%)] pointer-events-none" />

      {/* TOP EDITORIAL NAVIGATION BAR */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-[#28211a]/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#1d1611] border border-[#c9a96e]/30 flex items-center justify-center shadow-md">
            <Feather className="w-4 h-4 text-[#c9a96e]" />
          </div>
          <span className="font-cinzel text-xl font-bold tracking-widest text-[#f5ebe0]">
            SEMESTRIA
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs text-[#a39788] tracking-wider uppercase font-medium">
          <span onClick={() => handleNavClick('/')} className="hover:text-[#c9a96e] transition-colors cursor-pointer">Overview</span>
          <span onClick={() => handleNavClick('/timetable')} className="hover:text-[#c9a96e] transition-colors cursor-pointer">Timetable</span>
          <span onClick={() => handleNavClick('/subjects')} className="hover:text-[#c9a96e] transition-colors cursor-pointer">Subjects</span>
          <span onClick={() => handleNavClick('/evaluations')} className="hover:text-[#c9a96e] transition-colors cursor-pointer">Analytics</span>
          <span onClick={() => handleNavClick('/planner')} className="hover:text-[#c9a96e] transition-colors cursor-pointer">Planner</span>
        </nav>

        <div className="flex items-center space-x-2 text-xs text-[#c9a96e] font-mono">
          <Sun className="w-3.5 h-3.5 text-[#c9a96e]/70" />
          <span>AUTUMN ACADEMIC TERM</span>
        </div>
      </header>

      {/* FLOATING STUDY CARDS - LEFT SIDE (Removed until dynamic content is added) */}

      {/* FLOATING STUDY CARDS - RIGHT SIDE (Removed until dynamic content is added) */}

      {/* HERO SECTION: OPEN BOOK LEATHER JOURNAL EXPERIENCE */}
      <main className="relative z-20 max-w-2xl mx-auto text-center my-auto px-6 py-8">
        <div
          className={`transition-all duration-700 transform ${
            isLaunching ? 'scale-105 opacity-0 -translate-y-12 blur-sm' : 'scale-100 opacity-100'
          }`}
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -3}deg) rotateY(${mousePos.x * 3}deg)`
          }}
        >
          {/* Frosted Open Book Glass Container */}
          <div className="relative rounded-3xl p-10 bg-[#140e0a]/75 backdrop-blur-[24px] border border-[#c9a96e]/30 shadow-[0_30px_90px_rgba(0,0,0,0.95)] space-y-8 overflow-hidden group">
            {/* Subtle Gold Foil Moving Border Highlight */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-[#c9a96e]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-1000" />

            {/* Subtitle Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#1e1610] border border-[#c9a96e]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span className="text-[11px] text-[#c9a96e] font-cinzel font-semibold tracking-wider uppercase">
                Your Intelligent Semester Workspace
              </span>
            </div>

            {/* Luxury Editorial Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-cinzel font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f5ebe0] via-[#e8d7c3] to-[#c9a96e] leading-tight">
                Study Smarter.<br />
                Achieve More.
              </h1>
              <p className="text-lg font-serif italic text-[#c9a96e]/90 font-normal">
                One Beautiful Workspace.
              </p>
            </div>

            {/* Editorial Subtext */}
            <p className="text-xs sm:text-sm text-[#a39788] max-w-md mx-auto leading-relaxed font-sans">
              Organise your subjects. Track your academic progress. Plan your semester. Stay focused. Everything integrated in one serene environment.
            </p>

            {/* Premium CTA Button */}
            <div className="pt-3">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2c2016] via-[#3a2c1f] to-[#2c2016] hover:from-[#3a2c1f] hover:to-[#4a3928] text-[#f5ebe0] font-cinzel font-bold text-xs tracking-widest border border-[#c9a96e]/50 shadow-[0_10px_35px_rgba(201,169,110,0.2)] transition-all duration-300 flex items-center justify-center space-x-3 mx-auto transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
              >
                <span>OPEN DASHBOARD</span>
                <ArrowRight className="w-4 h-4 text-[#c9a96e] transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Keyboard Hint */}
            <p className="text-[10px] text-[#857868] font-mono pt-2">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#1d1611] text-[#c9a96e] border border-[#28211a]">ENTER</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[#1d1611] text-[#c9a96e] border border-[#28211a]">SPACE</kbd> to launch
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 border-t border-[#28211a]/40 flex justify-between items-center text-[10px] text-[#857868]">
        <div className="flex items-center space-x-2">
          <Coffee className="w-3.5 h-3.5 text-[#c9a96e]" />
          <span>CRAFTED FOR FOCUSED LEARNING</span>
        </div>
        <span className="font-cinzel tracking-wider text-[#c9a96e]">SEMESTRIA ACADEMIC EDITION</span>
      </footer>
    </div>
  );
};
