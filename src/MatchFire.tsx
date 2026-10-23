import { useEffect, useRef, useState } from 'react';
import './match-fire.css';

type Flame = { x: number; y: number; size: number; phase: number };
export function MatchFire({ preview = false, persistent = false, count = 15, caption = '¡A las buenas!' }: { preview?: boolean; persistent?: boolean; count?: number; caption?: string }) {
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const stage = canvas?.closest('.match-fire-stage');
    if (!canvas || !ctx || !stage) return;
    const reduced = !preview && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = persistent ? undefined : setTimeout(() => setVisible(false), 2800);
    let flames: Flame[] = [];
    let width = 0;
    let height = 0;
    const measure = () => {
      const bounds = stage.getBoundingClientRect();
      width = bounds.width + 48;
      height = bounds.height + 48;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      flames = [];
      const lines = [[12,10,44,10],[48,12,48,44],[44,48,12,48],[8,44,8,12],[7,50,49,7]];
      stage.querySelectorAll('.matches > svg').forEach((svg, group) => {
        const box = svg.getBoundingClientRect();
        const side = Math.min(box.width, box.height);
        const left = box.left - bounds.left + (box.width-side)/2 + 24;
        const top = box.top - bounds.top + (box.height-side)/2 + 36;
        lines.forEach(([x1,y1,x2,y2], line) => {
          if (group * 5 + line >= count) return;
          // Separate, translucent tongues leave the underlying wood visible.
          [.2,.6,1].forEach((fraction, part) => flames.push({
            x: left + (x1+(x2-x1)*fraction)*side/58,
            y: top + (y1+(y2-y1)*fraction)*side/58,
            size: side * (.21 + ((line*7+part*3+group)%5)*.025),
            phase: group*7.31 + line*2.37 + part*4.13,
          }));
        });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const t = Math.max(0, (now-start)/1000);
      ctx.clearRect(0,0,width,height);
      if (!persistent && t >= 2.8) return;
      const envelope = Math.min(1,t*10) * (persistent ? 1 : Math.min(1,(2.8-t)*3));
      for (const flame of flames) {
        const {x,y,phase} = flame;
        const flicker = .8 + .17*Math.sin(t*13+phase) + .12*Math.sin(t*23+phase*2.1);
        const length = flame.size*flicker*envelope;
        const sway = Math.sin(t*8+phase)*length*.22 + Math.sin(t*17+phase)*length*.07;
        const belly = Math.sin(t*10+phase+1)*length*.13;
        const radius = length*.15;
        const gradient = ctx.createLinearGradient(x,y,x,y-length);
        gradient.addColorStop(0,'rgba(100,145,255,.3)');
        gradient.addColorStop(.1,'rgba(255,247,186,.88)');
        gradient.addColorStop(.32,'rgba(255,202,67,.7)');
        gradient.addColorStop(.65,'rgba(255,100,17,.36)');
        gradient.addColorStop(1,'rgba(230,58,8,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x-radius*.5,y+1);
        ctx.bezierCurveTo(x-radius*1.7,y-length*.25,x+belly-radius,y-length*.62,x+sway,y-length);
        ctx.bezierCurveTo(x+sway-radius*.3,y-length*.62,x+radius*1.8,y-length*.32,x+radius*.5,y+1);
        ctx.closePath();
        ctx.fill();
        const glow = ctx.createRadialGradient(x,y-2,0,x,y-2,radius*1.7);
        glow.addColorStop(0,`rgba(255,220,126,${.3*envelope})`);
        glow.addColorStop(1,'rgba(255,112,10,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x-radius*2,y-radius*2,radius*4,radius*4);
      }
      frame = requestAnimationFrame(draw);
    };
    if (!reduced) frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); observer.disconnect(); };
  }, [preview, persistent, count]);
  if (!visible) return null;
  return <div className="match-fire" data-preview={preview} data-persistent={persistent} aria-hidden="true">
    <canvas ref={canvasRef} className="fire-column" />
    {caption && <span className="fire-caption">{caption}</span>}
  </div>;
}



export function MatchAsh({ count }: { count: number }) {
  return <div className="ash-piles" aria-hidden="true">{[0,1,2].map(group => {
    const points = Math.max(0, Math.min(5,count-group*5));
    return <svg key={group} viewBox="0 0 58 58">
      {points > 0 && <>
        <ellipse cx="29" cy="47" rx={9+points*3} ry="5" fill="#101214" opacity=".6" />
        {Array.from({length:points*13},(_,i) => {
          const x=29+Math.sin(i*7.3)*(7+points*3);
          const y=45+Math.cos(i*3.7)*4-(i%4);
          return <path key={i} d={`M${x} ${y}l${1+i%3} ${-1-i%2}l2 2l-2 1Z`} fill={['#7c7d79','#b5b2a9','#474b4b','#d6d0c2'][i%4]} />;
        })}
      </>}
    </svg>;
  })}</div>;
}
