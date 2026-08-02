import { useEffect, useRef } from 'react';

export default function ParticleGift({ message = 'I Love You', color = '#00d2ff', onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;

    const resize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Point {
      constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.t = Math.random() * Math.PI * 2;
        this.speed = 0.02 + Math.random() * 0.03;
        this.scale = 8 + Math.random() * 6;
      }
      update() {
        this.t += this.speed;
        const r = 16 * Math.pow(Math.sin(this.t), 3);
        const y = -(13 * Math.cos(this.t) - 5 * Math.cos(2*this.t) - 2 * Math.cos(3*this.t) - Math.cos(4*this.t));
        const z = 5 * Math.sin(this.t * 2) + 2 * Math.sin(this.t * 3);
        this.x = r * this.scale;
        this.y = y * this.scale;
        this.z = z * this.scale;
      }
    }

    for (let i = 0; i < 300; i++) {
      particles.push(new Point());
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      particles.forEach(p => {
        p.update();
        const fov = 300;
        const scale2d = fov / (fov + p.z);
        const x2d = cx + p.x * scale2d;
        const y2d = cy + p.y * scale2d;
        const alpha = Math.min(1, Math.max(0.2, 1 - Math.abs(p.z) / 50));
        
        ctx.beginPath();
        ctx.arc(x2d, y2d, 1.5 * scale2d, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.fillText(message, width/2, 70);
      ctx.shadowBlur = 0;
      
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [message, color]);

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <canvas ref={canvasRef} style={{width:'100%', height:'100%', display:'block'}} />
      <button onClick={onClose} style={{position:'absolute', bottom:'40px', background:'rgba(255,255,255,0.2)', color:'white', border:'1px solid white', padding:'10px 20px', borderRadius:'2rem', cursor:'pointer', fontWeight:'bold', fontSize:'1rem', transition:'0.2s'}} onMouseOver={(e) => e.target.style.background='rgba(255,255,255,0.4)'} onMouseOut={(e) => e.target.style.background='rgba(255,255,255,0.2)'}>Close Gift</button>
    </div>
  );
}
