import { useEffect, useRef } from 'react';

const COLORS = ['#FF47C4', '#C026D3', '#E040FB', '#a78bfa', '#c4b5fd', '#ffffff'];
const COUNT = 180;

function rand(a, b) { return Math.random() * (b - a) + a; }

export default function CosmosBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, animId;
    let particles = [];
    const bursts = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = rand(0, W);
        this.y = initial ? rand(0, H) : (Math.random() < 0.5 ? -10 : H + 10);
        this.size = rand(0.8, 2.8);
        this.baseSize = this.size;
        this.speedX = rand(-0.3, 0.3);
        this.speedY = rand(-0.15, -0.05);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.opacity = rand(0.2, 0.9);
        this.baseOpacity = this.opacity;
        this.breathPhase = rand(0, Math.PI * 2);
        this.breathSpeed = rand(0.008, 0.02);
        this.wobble = rand(0, Math.PI * 2);
        this.wobbleSpeed = rand(0.005, 0.015);
      }
      update() {
        this.breathPhase += this.breathSpeed;
        const b = Math.sin(this.breathPhase);
        this.opacity = this.baseOpacity + b * 0.15;
        this.size = this.baseSize + b * 0.4;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.12;
        this.y += this.speedY;
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130 && d > 0) {
          const f = (130 - d) / 130;
          this.x += (dx / d) * f * 0.9;
          this.y += (dy / d) * f * 0.9;
        }
        if (this.y < -20 || this.x < -20 || this.x > W + 20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    class BurstParticle {
      constructor(x, y) {
        this.x = x; this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(2, 8);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = rand(0.022, 0.05);
        this.size = rand(1.5, 4);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.92; this.vy *= 0.92;
        this.life -= this.decay;
      }
      draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    function drawConnections() {
      const MAX = 90;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX) {
            ctx.save();
            ctx.globalAlpha = (1 - d / MAX) * 0.12;
            ctx.strokeStyle = '#C026D3';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].update(); bursts[i].draw();
        if (bursts[i].life <= 0) bursts.splice(i, 1);
      }
      animId = requestAnimationFrame(animate);
    }

    const onMouseMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onClick = e => {
      for (let i = 0; i < 28; i++) bursts.push(new BurstParticle(e.clientX, e.clientY));
    };

    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
