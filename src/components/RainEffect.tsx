import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RainEffectProps {
  isPlaying: boolean;
  beatIntensity?: number; // optional intensity value from audio
}

interface Raindrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  opacity: number;
  width: number;
  splashHeight: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export const RainEffect: React.FC<RainEffectProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lightning, setLightning] = useState(false);

  // Periodic sheet lightning effect to simulate realistic stormy sky
  useEffect(() => {
    let lightningTimeout: NodeJS.Timeout;

    const triggerLightning = () => {
      // Trigger double flash for realism
      setLightning(true);
      setTimeout(() => {
        setLightning(false);
        // Second quick flash
        setTimeout(() => {
          setLightning(true);
          setTimeout(() => {
            setLightning(false);
          }, 150);
        }, 100);
      }, 200);

      // Schedule next lightning in 15 to 30 seconds
      const nextDelay = Math.random() * 15000 + 15000;
      lightningTimeout = setTimeout(triggerLightning, nextDelay);
    };

    // Initial delay for first lightning
    lightningTimeout = setTimeout(triggerLightning, 8000);

    return () => {
      clearTimeout(lightningTimeout);
    };
  }, []);

  // Rain Canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track window resizes
    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const raindrops: Raindrop[] = [];
    const splashes: SplashParticle[] = [];
    const ripples: Ripple[] = [];

    // Increase rain density if song is playing
    const maxDrops = isPlaying ? 180 : 110;

    // Initialize raindrops with 3D depth parallax modeling
    for (let i = 0; i < maxDrops; i++) {
      const z = Math.random() * 0.75 + 0.25; // 3D depth layer (0.25 to 1.0)
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vx: (Math.random() * 1.2 - 0.6) * z, // wind affects layers proportionally
        vy: (Math.random() * 14 + 16) * z,    // closer fall faster (parallax speed)
        len: (Math.random() * 18 + 12) * z,   // closer drops are longer (motion blur)
        opacity: (Math.random() * 0.35 + 0.15) * z, // closer are clearer, distant are faint
        width: (Math.random() * 1.2 + 0.4) * z, // closer are thicker
        splashHeight: height - Math.random() * 55 // puddle surface height variation
      });
    }

    const spawnSplash = (x: number, y: number, isBig: boolean) => {
      const pCount = isBig ? 6 : 4;
      for (let i = 0; i < pCount; i++) {
        splashes.push({
          x: x,
          y: y,
          vx: Math.random() * 4 - 2, // fly outwards horizontally
          vy: Math.random() * -3 - 1, // bounce upwards
          life: 0,
          maxLife: Math.random() * 15 + 10,
          size: Math.random() * 1.5 + 0.5,
          color: `rgba(180, 205, 230, ${Math.random() * 0.3 + 0.2})`
        });
      }
    };

    const animate = () => {
      // Fill canvas with clear rect or slight alpha background to create trails
      // We use a slight tail effect for high-end rain motion blur
      ctx.fillStyle = "rgba(2, 2, 3, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Draw and update drops
      for (let i = 0; i < raindrops.length; i++) {
        const d = raindrops[i];

        // Draw raindrop streak
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx * 1.5, d.y + d.len);
        ctx.strokeStyle = `rgba(165, 195, 225, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.stroke();

        // Update position
        d.x += d.vx;
        d.y += d.vy;

        // Reset drop and splash when it hits splashHeight
        if (d.y >= d.splashHeight) {
          // Spawn water splash
          spawnSplash(d.x, d.splashHeight, d.width > 1.2);

          // Spawn puddle water ripple (expanding perspective ellipse)
          ripples.push({
            x: d.x,
            y: d.splashHeight,
            radius: 1,
            maxRadius: Math.random() * 20 + 15,
            opacity: d.opacity * 0.9,
            speed: Math.random() * 0.3 + 0.3
          });

          // Reset drop back to top with depth variation
          const z = Math.random() * 0.75 + 0.25;
          d.x = Math.random() * width;
          d.y = -d.len - Math.random() * 80;
          d.vx = (Math.random() * 1.2 - 0.6) * z;
          d.vy = (Math.random() * 14 + 16) * z;
          d.len = (Math.random() * 18 + 12) * z;
          d.opacity = (Math.random() * 0.35 + 0.15) * z;
          d.width = (Math.random() * 1.2 + 0.4) * z;
          d.splashHeight = height - Math.random() * 55;
        }
      }

      // Draw and update splash particles
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();

        // Update splash particle physics
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // gravity pull on splashes
        s.life++;

        // Remove dead particles
        if (s.life >= s.maxLife) {
          splashes.splice(i, 1);
        }
      }

      // Draw and update puddle ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        // Ellipse with 3.5:1 ratio for nice perspective flat puddle ripple projection
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.28, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 195, 230, ${r.opacity})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Secondary outer subtle ring
        if (r.radius > 6) {
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius - 4, (r.radius - 4) * 0.28, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(165, 195, 230, ${r.opacity * 0.45})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }

        r.radius += r.speed;
        r.opacity -= 0.012; // slow elegant fadeout

        if (r.opacity <= 0) {
          ripples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none"
    >
      {/* Stormy Sky Dark Clouds Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          background: "radial-gradient(circle at 50% 30%, #151b26 0%, #06090e 100%)",
        }}
      >
        {/* Layered clouds drifting across the backdrop */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color-dodge">
          <motion.div 
            animate={{
              x: ["0%", "-20%"],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 90,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-[150%] h-[150%] -top-1/4 -left-1/4"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.03) 0%, transparent 50%)"
            }}
          />
          <motion.div 
            animate={{
              x: ["0%", "15%"],
              scale: [1.02, 0.98, 1.02]
            }}
            transition={{
              duration: 120,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-[140%] h-[140%] -top-1/5 -left-1/5"
            style={{
              backgroundImage: "radial-gradient(circle at 80% 15%, rgba(255,255,255,0.05) 0%, transparent 55%), radial-gradient(circle at 20% 70%, rgba(255,255,255,0.02) 0%, transparent 45%)"
            }}
          />
        </div>

        {/* Dynamic Storm Cloud Ambient Lighting Sheet Flashes */}
        <AnimatePresence>
          {lightning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.random() * 0.45 + 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.05 }}
              className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
              style={{
                background: "radial-gradient(circle at 50% 15%, rgba(200, 225, 255, 0.4) 0%, rgba(50, 100, 200, 0.15) 50%, transparent 100%)"
              }}
            />
          )}
        </AnimatePresence>

        {/* Ambient Storm vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020203]/90" />
      </div>

      {/* High-fidelity Rain Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-70"
      />
    </div>
  );
};
