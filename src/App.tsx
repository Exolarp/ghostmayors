/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  Info, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Cpu, 
  Maximize2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Github,
  Globe,
  Mail,
  Instagram,
  Gamepad2
} from "lucide-react";
import { 
  SyncedLyricsBackground, 
  KODAK_24_LYRICS 
} from "./components/SyncedLyrics";
import { RainEffect } from "./components/RainEffect";

// Presets representing different dark glassmorphic aesthetics
interface Preset {
  name: string;
  opacity: number;
  blur: number;
  borderRadius: number;
  glowColor: "white" | "purple" | "cyan" | "crimson";
  glowIntensity: number;
  tiltStrength: number;
  breathingSpeed: number;
}

const PRESETS: Record<string, Preset> = {
  "Sleek Interface": {
    name: "Sleek Interface",
    opacity: 0.40,
    blur: 28,
    borderRadius: 32,
    glowColor: "white",
    glowIntensity: 0.10,
    tiltStrength: 0.8,
    breathingSpeed: 7
  },
  "Classic Glass": {
    name: "Classic Glass",
    opacity: 0.25,
    blur: 16,
    borderRadius: 16,
    glowColor: "white",
    glowIntensity: 0.15,
    tiltStrength: 1.0,
    breathingSpeed: 6
  },
  "Obsidian Void": {
    name: "Obsidian Void",
    opacity: 0.65,
    blur: 24,
    borderRadius: 8,
    glowColor: "purple",
    glowIntensity: 0.25,
    tiltStrength: 0.7,
    breathingSpeed: 8
  },
  "Cyber Cybernetic": {
    name: "Cyber Cybernetic",
    opacity: 0.15,
    blur: 8,
    borderRadius: 24,
    glowColor: "cyan",
    glowIntensity: 0.35,
    tiltStrength: 1.3,
    breathingSpeed: 4
  },
  "Sartorial Monolith": {
    name: "Sartorial Monolith",
    opacity: 0.40,
    blur: 32,
    borderRadius: 0,
    glowColor: "crimson",
    glowIntensity: 0.30,
    tiltStrength: 0.5,
    breathingSpeed: 10
  }
};

export default function App() {
  // Core Aesthetic States
  const [opacity, setOpacity] = useState<number>(0.40);
  const [blur, setBlur] = useState<number>(28);
  const [borderRadius, setBorderRadius] = useState<number>(32);
  const [glowColor, setGlowColor] = useState<"white" | "purple" | "cyan" | "crimson">("white");
  const [glowIntensity, setGlowIntensity] = useState<number>(0.10);
  const [tiltStrength, setTiltStrength] = useState<number>(0.8);
  const [breathingSpeed, setBreathingSpeed] = useState<number>(7); // seconds per loop
  const [activeTab, setActiveTab] = useState<"about" | "specs" | "export">("about");
  
  // UI Panels
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activePreset, setActivePreset] = useState("Sleek Interface");

  // Playback & Lyrics Sync State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(228); // 228 seconds default for Kodak Black "24"
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);
  const [isCustomFileLoaded, setIsCustomFileLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Parallax Particles Background State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);

  // Web Audio Synth Reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  // Card Parallax Tilt setup
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth springs for high-end feel
  const springX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  // Map normalized coordinates [-0.5, 0.5] to tilt angle based on strength
  const rotateX = useTransform(springY, [-0.5, 0.5], [15 * tiltStrength, -15 * tiltStrength]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15 * tiltStrength, 15 * tiltStrength]);
  
  // Parallax image shift
  const imgShiftX = useTransform(springX, [-0.5, 0.5], [-12 * tiltStrength, 12 * tiltStrength]);
  const imgShiftY = useTransform(springY, [-0.5, 0.5], [-12 * tiltStrength, 12 * tiltStrength]);

  // Apply a preset
  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setActivePreset(presetName);
      setOpacity(preset.opacity);
      setBlur(preset.blur);
      setBorderRadius(preset.borderRadius);
      setGlowColor(preset.glowColor);
      setGlowIntensity(preset.glowIntensity);
      setTiltStrength(preset.tiltStrength);
      setBreathingSpeed(preset.breathingSpeed);
    }
  };

  // Generate particles once
  useEffect(() => {
    const generated = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.15 + 0.05,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(generated);
  }, []);

  // Track global cursor movement for ambient illumination & dynamic shift
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  // Synchronized Player Action Handlers
  const handlePlayPause = () => {
    if (isCustomFileLoaded && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsMuted(false);
        audioRef.current.muted = false;
        audioRef.current.play().catch(err => {
          console.warn("Playback prevented by browser policies:", err);
        });
        setIsPlaying(true);
      }
    } else {
      // Synth Mode Player
      if (isPlaying) {
        setIsPlaying(false);
        stopAmbientSynth();
        if (synthIntervalRef.current) {
          clearInterval(synthIntervalRef.current);
          synthIntervalRef.current = null;
        }
      } else {
        setIsPlaying(true);
        setIsMuted(false);
        startAmbientSynth();
        
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            if (prev >= duration) {
              return 0; // loop back
            }
            return prev + 1;
          });
        }, 1000);
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (isCustomFileLoaded && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    
    if (isCustomFileLoaded && audioRef.current) {
      audioRef.current.muted = nextMute;
    } else {
      if (nextMute) {
        stopAmbientSynth();
      } else if (isPlaying) {
        startAmbientSynth();
      }
    }
  };

  const handleUploadFile = (file: File) => {
    try {
      const fileUrl = URL.createObjectURL(file);
      setIsCustomFileLoaded(true);
      
      stopAmbientSynth();
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current.src = fileUrl;
        audioRef.current.load();
        
        setIsMuted(false);
        audioRef.current.muted = false;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.warn("Could not play uploaded audio immediately:", err);
            setIsPlaying(false);
          });
      }
    } catch (e) {
      console.error("Error loading custom audio file:", e);
    }
  };

  // Synthesize background ambient drone on interaction (Compat wrapper for header button)
  const toggleMute = () => {
    handlePlayPause();
  };

  const startAmbientSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Base carrier low hum (A1 frequency @ ~55Hz)
      const oscBase = ctx.createOscillator();
      oscBase.type = "sine";
      oscBase.frequency.setValueAtTime(55, ctx.currentTime);

      // Slightly detuned second oscillator for lush movement / chorus effect
      const oscChor = ctx.createOscillator();
      oscChor.type = "sine";
      oscChor.frequency.setValueAtTime(55.25, ctx.currentTime);

      // Higher harmonic adding depth (E2 frequency @ ~82.4Hz)
      const oscHarm = ctx.createOscillator();
      oscHarm.type = "sine";
      oscHarm.frequency.setValueAtTime(82.41, ctx.currentTime);

      // Low pass filter to remove harshness and create deep warm sub drone
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(110, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      // Very subtle slow modulation (LFO) on filter frequency to make it "breathe"
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow, 12s period
      lfoGain.gain.setValueAtTime(15, ctx.currentTime); // modulate up/down by 15Hz

      // Master output volume (kept low so it's a pleasant background hum)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
      // Fade-in to prevent click pop
      gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.5);

      // Connect LFO modulation to filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Connect oscillators to low-pass filter
      oscBase.connect(filter);
      oscChor.connect(filter);
      oscHarm.connect(filter);

      // Connect filter to main gain
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Play notes
      lfo.start();
      oscBase.start();
      oscChor.start();
      oscHarm.start();

      // Store nodes to terminate later
      oscsRef.current = [oscBase, oscChor, oscHarm, lfo];
      gainRef.current = gainNode;
    } catch (error) {
      console.warn("Web Audio API not fully initialized or blocked:", error);
    }
  };

  const stopAmbientSynth = () => {
    if (gainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const gain = gainRef.current;
      try {
        // Fade out gracefully before stopping
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        
        setTimeout(() => {
          oscsRef.current.forEach(osc => {
            try { osc.stop(); } catch(e){}
          });
          oscsRef.current = [];
          try { ctx.close(); } catch(e){}
          audioCtxRef.current = null;
        }, 1000);
      } catch (error) {
        console.error("Error fading out synth:", error);
      }
    }
  };

  // Attempt to load default Kodak Black '24' mp3 file from Catbox upload on mount and trigger unmuted Autoplay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = "https://files.catbox.moe/08wnjd.mp3";
      audioRef.current.load();
      
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.muted = false;
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setIsMuted(false);
              // Clean up listeners once playback is successfully running
              document.removeEventListener("click", playAudio);
              document.removeEventListener("keydown", playAudio);
              document.removeEventListener("touchstart", playAudio);
              document.removeEventListener("mousemove", playAudio);
            })
            .catch(err => {
              console.warn("Autoplay blocked, waiting for user gesture:", err);
            });
        }
      };

      // Try playing immediately
      playAudio();

      // Fallback: Bind events on the document to start playing upon any user gesture
      document.addEventListener("click", playAudio);
      document.addEventListener("keydown", playAudio);
      document.addEventListener("touchstart", playAudio);
      document.addEventListener("mousemove", playAudio);

      return () => {
        document.removeEventListener("click", playAudio);
        document.removeEventListener("keydown", playAudio);
        document.removeEventListener("touchstart", playAudio);
        document.removeEventListener("mousemove", playAudio);
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup synth on unmount
      if (audioCtxRef.current) {
        oscsRef.current.forEach(osc => {
          try { osc.stop(); } catch(e){}
        });
        try { audioCtxRef.current.close(); } catch(e){}
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
    };
  }, []);

  // Handle local tilt tracking on Card mousemove
  const handleCardMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize offsets between -0.5 and 0.5
    const relativeX = (event.clientX - rect.left - width / 2) / width;
    const relativeY = (event.clientY - rect.top - height / 2) / height;
    
    rawX.set(relativeX);
    rawY.set(relativeY);
  };

  const handleCardMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  // Generate glow color style strings based on selection
  const getGlowStyles = () => {
    switch (glowColor) {
      case "purple":
        return {
          shadow: `0 10px 40px -10px rgba(168, 85, 247, ${glowIntensity * 1.5}), 0 0 16px rgba(168, 85, 247, ${glowIntensity})`,
          border: `rgba(168, 85, 247, ${glowIntensity * 2})`,
          accentText: "text-purple-400",
          accentBg: "bg-purple-500",
          accentRing: "focus:ring-purple-500/50",
          accentBorder: "border-purple-500/20"
        };
      case "cyan":
        return {
          shadow: `0 10px 40px -10px rgba(6, 182, 212, ${glowIntensity * 1.5}), 0 0 16px rgba(6, 182, 212, ${glowIntensity})`,
          border: `rgba(6, 182, 212, ${glowIntensity * 2})`,
          accentText: "text-cyan-400",
          accentBg: "bg-cyan-500",
          accentRing: "focus:ring-cyan-500/50",
          accentBorder: "border-cyan-500/20"
        };
      case "crimson":
        return {
          shadow: `0 10px 40px -10px rgba(239, 68, 68, ${glowIntensity * 1.5}), 0 0 16px rgba(239, 68, 68, ${glowIntensity})`,
          border: `rgba(239, 68, 68, ${glowIntensity * 2})`,
          accentText: "text-red-400",
          accentBg: "bg-red-500",
          accentRing: "focus:ring-red-500/50",
          accentBorder: "border-red-500/20"
        };
      case "white":
      default:
        return {
          shadow: `0 10px 40px -10px rgba(255, 255, 255, ${glowIntensity * 1.5}), 0 0 16px rgba(255, 255, 255, ${glowIntensity})`,
          border: `rgba(255, 255, 255, ${glowIntensity * 2.2})`,
          accentText: "text-zinc-300",
          accentBg: "bg-zinc-100",
          accentRing: "focus:ring-white/50",
          accentBorder: "border-white/20"
        };
    }
  };

  const glowStyles = getGlowStyles();

  // Copy CSS variables helper
  const copyStylesToClipboard = () => {
    const cssCode = `/* Glassmorphic Profile Card Styled with Tailwind CSS */
<div className="relative group rounded-[${borderRadius}px] overflow-hidden" 
     style={{
       background: "rgba(10, 10, 10, ${opacity})",
       backdropFilter: "blur(${blur}px)",
       borderColor: "${glowStyles.border}",
       boxShadow: "${glowStyles.shadow}",
       borderWidth: "1px",
       borderStyle: "solid"
     }}>
  <img src="https://files.catbox.moe/rrozkr.jpg" style={{ borderRadius: "${borderRadius}px" }} />
</div>`;

    navigator.clipboard.writeText(cssCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020202] select-none">
      
      {/* Realistic Rainy Sky & Rain Generator */}
      <RainEffect isPlaying={isPlaying} />

      {/* SVG Water Ripple filter used for the portrait reflection */}
      <svg className="absolute w-0 h-0 pointer-events-none select-none">
        <defs>
          <filter id="water-ripple">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="1" result="noise">
              <animate attributeName="baseFrequency" dur="12s" keyTimes="0;0.5;1" values="0.015 0.08; 0.015 0.12; 0.015 0.08" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      
      {/* HTML5 audio engine */}
      <audio
        ref={audioRef}
        autoPlay
        muted={false}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onLoadedMetadata={() => {
          setIsCustomFileLoaded(true);
        }}
        onError={() => {
          setIsCustomFileLoaded(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        loop
        className="hidden"
      />

      {/* Dynamic Background Scrolling Lyrics */}
      <SyncedLyricsBackground 
        currentTime={currentTime}
        isPlaying={isPlaying}
        onSelectTime={handleSeek}
        isFullscreen={isFullscreenLyrics}
        opacity={opacity}
      />
      
      {/* Background Interactive Elements & Layered Grids */}
      <div className={`absolute inset-0 z-0 opacity-40 mesh-grid pointer-events-none transition-opacity duration-1000 ${isFullscreenLyrics ? 'opacity-5' : 'opacity-40'}`} />
      
      {/* Sleek Interface Theme: Ambient Accent Glow Spots */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[120px] -top-96 -left-48 pointer-events-none z-0" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[100px] -bottom-48 -right-48 pointer-events-none z-0" />



      {/* Dynamic Cursor Light Source */}
      <div 
        className="absolute z-0 w-[45vw] h-[45vw] rounded-full pointer-events-none blur-[120px] transition-all duration-300 ease-out opacity-25"
        style={{
          left: `${mousePosition.x - 22.5}%`,
          top: `${mousePosition.y - 22.5}%`,
          background: glowColor === 'white' 
            ? 'radial-gradient(circle, rgba(120,120,135,0.4) 0%, rgba(0,0,0,0) 70%)'
            : glowColor === 'purple'
            ? 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(0,0,0,0) 70%)'
            : glowColor === 'cyan'
            ? 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(0,0,0,0) 70%)'
            : 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(0,0,0,0) 70%)'
        }}
      />

      {/* Floating Dust Particles to create deep 3D atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
            }}
            animate={{
              y: ["0vh", "100vh"],
              x: ["0vw", `${(Math.sin(p.id) * 4)}vw`]
            }}
            transition={{
              duration: 40 / p.speed,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Top Header: Title & Mute Controller */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-12 pointer-events-auto">
        <div className="flex-1" />

        {/* Ambient Soundtrack Trigger */}
        <button
          onClick={toggleMute}
          id="toggle-audio-btn"
          className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 text-zinc-400 hover:text-white transition-all duration-300 text-xs font-mono group"
          title={isMuted ? "Unmute atmospheric drone" : "Mute background drone"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span className="hidden sm:inline text-[10px] tracking-widest uppercase">Atmosphere Off</span>
            </>
          ) : (
            <>
              <Volume2 className={`w-3.5 h-3.5 ${glowStyles.accentText} animate-pulse`} />
              <span className="hidden sm:inline text-[10px] tracking-widest uppercase">Atmosphere Live</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container: Centered Presentation Card */}
      <main 
        className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 md:px-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          opacity: isFullscreenLyrics ? 0 : 1,
          pointerEvents: isFullscreenLyrics ? "none" : "auto",
          transform: isFullscreenLyrics ? "scale(0.85) translateY(40px)" : "scale(1) translateY(0px)",
          filter: isFullscreenLyrics ? "blur(10px)" : "none"
        }}
      >
        
        {/* The Float/Breathing Animation Container */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
          }}
          transition={{
            duration: breathingSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center"
        >
          {/* Main Glassmorphic Interactive 3D Card */}
          <div 
            className="perspective-1000 relative group"
            style={{ perspective: "1200px" }}
          >
            {/* Sleek Interface Theme: Floating back shadow glow */}
            <div 
              className="absolute inset-0 bg-white/5 blur-2xl transition-all duration-500 pointer-events-none z-0" 
              style={{ borderRadius: `${borderRadius}px` }}
            />

            <motion.div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                rotateX: rotateX,
                rotateY: rotateY,
                transformStyle: "preserve-3d",
                backgroundColor: `rgba(10, 10, 10, ${opacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                borderRadius: `${borderRadius}px`,
                borderColor: glowStyles.border,
                boxShadow: glowStyles.shadow,
              }}
              className="relative w-full max-w-[340px] md:w-[360px] p-8 border flex flex-col items-center select-none transition-all duration-100 ease-out cursor-grab active:cursor-grabbing hover:border-white/20 z-10"
            >
              
              {/* Internal card light highlights for simulated premium 3D materials */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 opacity-50 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)"
                }}
              />

              {/* Dynamic light reflection based on card angle */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[inherit] mix-blend-overlay"
                style={{
                  background: useTransform(
                    [springX, springY],
                    ([sx, sy]) => `radial-gradient(circle at ${50 + (sx as number) * 60}% ${50 + (sy as number) * 60}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%)`
                  )
                }}
              />

              {/* Sleek Interface Theme: Floating Image Wrapper with Glow and Badge */}
              <div 
                className="relative w-48 h-48 mb-8"
                style={{ 
                  transform: "translateZ(30px)",
                }}
              >
                {/* Outer halo blur border */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl blur-sm pointer-events-none" />

                 {/* Main Image Frame container */}
                <div className="w-full h-full rounded-3xl overflow-hidden relative border border-white/20 shadow-inner bg-zinc-950/40">
                  {/* Profile Image with subtle 3D parallax displacement inside its frame */}
                  <motion.img
                    src="https://files.catbox.moe/rrozkr.jpg"
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    style={{
                      x: imgShiftX,
                      y: imgShiftY,
                    }}
                    className="w-full h-full object-cover scale-105 pointer-events-none transition-transform duration-500 select-none"
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 1.2 }}
                  />

                  {/* Cool Edit: Rain-on-glass sliding water droplets overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-65">
                    {[...Array(6)].map((_, idx) => (
                      <motion.div
                        key={idx}
                        className="absolute w-[1.5px] bg-gradient-to-b from-white/70 via-white/40 to-transparent rounded-full"
                        style={{
                          left: `${12 + idx * 16 + Math.sin(idx) * 4}%`,
                          height: idx % 2 === 0 ? "14px" : "22px",
                        }}
                        animate={{
                          y: ["-25px", "195px"],
                          opacity: [0, 0.85, 0.85, 0],
                        }}
                        transition={{
                          duration: 2.8 + idx * 1.1,
                          repeat: Infinity,
                          ease: "linear",
                          delay: idx * 0.6,
                        }}
                      />
                    ))}
                    {/* Small static splash nodes */}
                    {[...Array(4)].map((_, idx) => (
                      <div
                        key={`static-${idx}`}
                        className="absolute w-1 h-1 rounded-full bg-white/20 blur-[0.2px]"
                        style={{
                          left: `${25 + idx * 20}%`,
                          top: `${40 + idx * 15}%`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Subtle digital vignette overlay */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>

                {/* Sleek Interface Theme: Pulsing emerald active indicator */}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4.5 h-4.5 rounded-full border-4 border-[#020202] shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20 animate-pulse" />
              </div>

              {/* Textual Profile Details Layer */}
              <div 
                className="w-full text-center flex flex-col items-center"
                style={{ transform: "translateZ(45px)" }}
              >
                {/* Sleek Interface Theme: Light elegant displaying headers */}
                <h1 className="font-display font-light tracking-[0.2em] text-white/90 text-3xl uppercase mt-1 mb-6">
                  Ghostmayors
                </h1>

                {/* Sleek Interface Theme: Beautiful Gradient Spacer Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                {/* Interactive Dynamic Tabs for Card Bottom */}
                <div className="flex w-full bg-black/40 border border-white/5 rounded-xl p-0.5 mb-6 text-[10px] font-mono select-none">
                  {(["about", "specs", "export"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-white/[0.08] text-white font-medium"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Dynamic Tab Content with smooth crossfade */}
                <div className="w-full min-h-[142px] text-left px-1">
                  <AnimatePresence mode="wait">
                    {activeTab === "about" && (
                      <motion.div
                        key="about-tab"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-[12px] text-white/70 font-sans leading-relaxed text-center font-light pt-2"
                      >
                        Even when i am not there, i will be always involved and unseen.
                      </motion.div>
                    )}

                    {activeTab === "specs" && (
                      <motion.div
                        key="specs-tab"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2.5 w-full"
                      >
                        {/* Sleek Interface Theme: Group Row styling panels */}
                        <div className="flex justify-between items-center px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[9px] uppercase tracking-widest text-white/40">IDENTIFIER</span>
                          <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono">ghostmayors_source_x</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[9px] uppercase tracking-widest text-white/40">RESOLUTION</span>
                          <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono">1024 × 1024 PX</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[9px] uppercase tracking-widest text-white/40">BORDER GLOW</span>
                          <span className={`text-[10px] uppercase tracking-widest font-mono font-medium ${glowStyles.accentText}`}>
                            {glowColor} ({Math.round(glowIntensity * 100)}%)
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[9px] uppercase tracking-widest text-white/40">GLASS BLUR</span>
                          <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono">{blur}PX</span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "export" && (
                      <motion.div
                        key="export-tab"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center space-y-3 pt-2"
                      >
                        <p className="text-[10px] font-mono text-zinc-400 text-center uppercase tracking-widest">
                          Export Glass CSS Configuration
                        </p>
                        <button
                          onClick={copyStylesToClipboard}
                          className="flex items-center space-x-2 px-4 py-2 w-full justify-center bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white rounded-xl font-mono text-xs tracking-wider transition-all duration-300 group"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">COPIED SUCCESSFULLY</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                              <span>COPY CLASS INSTANCE</span>
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sleek Interface Theme: Gradient Divider Line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-6 mb-6" />

                {/* Sleek Interface Theme: Circular Social Actions Row */}
                <div className="flex gap-4 pt-1 justify-center">
                  <a
                    href="https://www.roblox.com/users/181055242/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
                    title="Roblox Profile"
                  >
                    <Gamepad2 className="w-4.5 h-4.5" />
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); }}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
                    title="Send Message"
                  >
                    <Mail className="w-4.5 h-4.5" />
                  </a>
                </div>

              </div> {/* Closes textual profile details layer */}
            </motion.div> {/* Closes main glassmorphic interactive 3D card */}

            {/* Realistic portrait card wet-surface ripple reflection */}
            <div 
              className="absolute -bottom-[92%] left-1/2 -translate-x-1/2 w-[280px] md:w-[360px] pointer-events-none select-none z-0 block"
              style={{
                transform: "scaleY(-0.82) rotateX(12deg)",
                opacity: 0.24,
                filter: "url(#water-ripple) blur(1.5px) brightness(0.7)",
                maskImage: "linear-gradient(to top, transparent 10%, rgba(0,0,0,0.85) 100%)",
                WebkitMaskImage: "linear-gradient(to top, transparent 10%, rgba(0,0,0,0.85) 100%)",
              }}
            >
              {/* Mirrored card contents */}
              <div 
                style={{
                  backgroundColor: `rgba(10, 10, 10, ${opacity})`,
                  borderRadius: `${borderRadius}px`,
                  borderColor: "rgba(255, 255, 255, 0.05)",
                }}
                className="w-full p-8 border flex flex-col items-center"
              >
                {/* Flipped Portrait Image */}
                <div className="w-48 h-48 rounded-3xl overflow-hidden relative border border-white/10 bg-zinc-950/40">
                  <img
                    src="https://files.catbox.moe/rrozkr.jpg"
                    alt="Reflected Profile"
                    className="w-full h-full object-cover scale-105 pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>
                
                {/* Reflected Text details */}
                <h1 className="font-display font-light tracking-[0.2em] text-white/70 text-3xl uppercase mt-8 mb-6">
                  Ghostmayors
                </h1>
              </div>
            </div>
          </div> {/* Closes perspective wrapper */}
        </motion.div> {/* Closes breathing animation container */}
      </main> {/* Closes main tag */}







      {/* Visual Rain Puddle Overlay at the bottom of the screen */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[22vh] z-0 pointer-events-none select-none overflow-hidden animate-fade-in"
        style={{
          background: "linear-gradient(to bottom, rgba(2, 2, 3, 0) 0%, rgba(5, 10, 20, 0.45) 40%, rgba(8, 12, 24, 0.8) 100%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(2px)",
        }}
      >
        {/* Gloss sheen */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent opacity-50" />
      </div>

    </div>
  );
}
