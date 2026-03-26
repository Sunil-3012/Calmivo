import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Landing        from './pages/Landing.jsx';
import Chat           from './pages/Chat.jsx';
import Mood           from './pages/Mood.jsx';
import Resources      from './pages/Resources.jsx';
import CosmosBackground from './components/CosmosBackground.jsx';

// Scroll-reveal observer (runs on every route change)
function ScrollObserver() {
  const { pathname } = useLocation();

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  return null;
}

// Cursor glow + scroll progress bar (persistent across all pages)
function GlobalEffects() {
  const glowRef   = useRef(null);
  const barRef    = useRef(null);
  const glowX     = useRef(window.innerWidth / 2);
  const glowY     = useRef(window.innerHeight / 2);
  const targetX   = useRef(glowX.current);
  const targetY   = useRef(glowY.current);
  const animId    = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    const bar  = barRef.current;

    // Cursor glow — lag follows mouse
    const onMove = e => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      glow.style.opacity = '1';
    };
    const onLeave = () => { glow.style.opacity = '0'; };

    function animateGlow() {
      glowX.current += (targetX.current - glowX.current) * 0.08;
      glowY.current += (targetY.current - glowY.current) * 0.08;
      glow.style.left = glowX.current + 'px';
      glow.style.top  = glowY.current + 'px';
      animId.current = requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Scroll progress bar
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div ref={barRef} className="scroll-progress" />
      {/* Cursor glow */}
      <div ref={glowRef} className="cursor-glow" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Cosmos background on every page */}
      <CosmosBackground />

      {/* Gradient blob orbs — slow floating color depth */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Cursor glow + scroll bar */}
      <GlobalEffects />

      <ScrollObserver />

      <Routes>
        <Route path="/"          element={<Landing   />} />
        <Route path="/chat"      element={<Chat      />} />
        <Route path="/mood"      element={<Mood      />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </BrowserRouter>
  );
}
