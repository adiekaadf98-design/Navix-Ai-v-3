import React, { useEffect, useRef, useState } from 'react';
import { GitBranch, Activity, Check, Sparkles } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

const FEATURED_SKILLS = [
  { name: 'LangChain', tag: 'AI Agent', color: '#f59e0b' },
  { name: 'OpenCV', tag: 'Vision', color: '#ef4444' },
  { name: 'FFmpeg', tag: 'Media', color: '#10b981' },
  { name: 'TA-Lib', tag: 'Trading', color: '#06b6d4' },
  { name: 'CCXT', tag: 'Crypto', color: '#8b5cf6' },
  { name: 'PineScript', tag: 'Quant', color: '#ec4899' },
  { name: 'PyTorch', tag: 'Neural', color: '#f97316' },
  { name: 'Pandas', tag: 'Data', color: '#3b82f6' },
];

export const LiveSkillsConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSkill, setActiveSkill] = useState<string>('LangChain');
  const [syncedCount, setSyncedCount] = useState<number>(50428);

  useEffect(() => {
    // Dynamic ticker for live skills sync
    const interval = setInterval(() => {
      setSyncedCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || 300);
    let height = (canvas.height = 130);

    const handleResize = () => {
      if (containerRef.current && canvas) {
        width = canvas.width = containerRef.current.clientWidth;
        height = canvas.height = 130;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initialize interactive constellation nodes
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'];
    const nodes: Node[] = FEATURED_SKILLS.map((skill, i) => {
      const angle = (i / FEATURED_SKILLS.length) * Math.PI * 2;
      const dist = Math.min(width, height) * 0.35;
      return {
        id: skill.name,
        label: skill.name,
        category: skill.tag,
        x: width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
        y: height / 2 + Math.sin(angle) * (dist * 0.7) + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 3.5,
        color: skill.color,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce on borders
        if (node.x < 15 || node.x > width - 15) node.vx *= -1;
        if (node.y < 15 || node.y > height - 15) node.vy *= -1;
      }

      // Draw connection lines with glowing pulse
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = width > 350 ? 110 : 80;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            // Pulse wave traveling on lines
            const pulse = (Math.sin(time * 3 + dist * 0.05) + 1) / 2;
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * (0.6 + pulse * 0.4)})`;
            ctx.lineWidth = 1 + pulse * 0.6;
            ctx.stroke();

            // Draw traveling particle on line
            if (pulse > 0.85) {
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulse;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulse;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 4;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw nodes (bintik bulatan)
      for (const node of nodes) {
        const pulse = Math.sin(time * 2.5 + node.pulsePhase) * 1.5;
        const currentRadius = Math.max(2, node.radius + pulse * 0.5);

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}22`;
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above/below node
        ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - 7);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full space-y-2.5">
      {/* Visual Live Canvas with Connected Bulatan */}
      <div className="relative w-full h-[130px] rounded-xl bg-neutral-950/80 border border-amber-500/20 overflow-hidden shadow-inner">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.75px,transparent_0.75px)] [background-size:12px_12px] opacity-10 pointer-events-none" />
        
        {/* Top live badge */}
        <div className="absolute top-2 left-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono font-bold text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>LIVE SKILLS MATRIX</span>
        </div>

        <div className="absolute top-2 right-2.5 z-10 text-[9px] font-mono text-neutral-400">
          <span className="text-amber-400 font-bold">{syncedCount.toLocaleString()}</span> Repos Active
        </div>

        {/* Dynamic HTML5 Canvas rendering interactive constellation */}
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Bottom micro legend */}
        <div className="absolute bottom-1.5 inset-x-2.5 flex items-center justify-between text-[8px] font-mono text-neutral-500 pointer-events-none">
          <span>● Neural Graph Topology</span>
          <span>Real-time Interlink ⚡</span>
        </div>
      </div>

      {/* Interactive skill pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {FEATURED_SKILLS.slice(0, 6).map((skill) => (
          <span
            key={skill.name}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 hover:border-amber-500/40 hover:text-white transition-all cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skill.color }} />
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
};
