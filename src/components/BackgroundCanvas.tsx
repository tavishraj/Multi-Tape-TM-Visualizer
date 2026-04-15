import { useEffect, useRef } from 'react';

const SYMBOLS = ['δ', 'Σ', 'Γ', 'q₀', 'λ', '∈', '⊢', '⊣', 'Δ', '∅', '∀', '∃', '→', '⟨', '⟩', 'Ω'];
const BINARY = '01';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  size: number;
  opacity: number;
  type: 'symbol' | 'binary';
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const count = 60;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const isSymbol = Math.random() > 0.5;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        text: isSymbol
          ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          : Array.from({ length: Math.floor(Math.random() * 6) + 3 }, () => BINARY[Math.floor(Math.random() * 2)]).join(''),
        size: isSymbol ? 14 + Math.random() * 10 : 10 + Math.random() * 4,
        opacity: 0.04 + Math.random() * 0.08,
        type: isSymbol ? 'symbol' : 'binary',
      });
    }
    particlesRef.current = particles;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      for (const p of particles) {
        // Subtle parallax based on cursor
        const dx = (mouse.x - canvas.width / 2) * 0.0003;
        const dy = (mouse.y - canvas.height / 2) * 0.0003;

        p.x += p.vx + dx;
        p.y += p.vy + dy;

        // Wrap around
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        // Distance from cursor for glow effect
        const dist = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
        const glow = Math.max(0, 1 - dist / 300) * 0.15;

        ctx.save();
        ctx.font = `${p.size}px "Fira Code", monospace`;
        ctx.fillStyle =
          p.type === 'symbol'
            ? `rgba(0, 255, 255, ${p.opacity + glow})`
            : `rgba(180, 120, 255, ${p.opacity * 0.7 + glow * 0.5})`;
        ctx.shadowColor = p.type === 'symbol' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(180, 120, 255, 0.2)';
        ctx.shadowBlur = glow > 0.02 ? 15 : 0;
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      }

      // Draw faint grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.015)';
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
