import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Music, 
  Upload, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Info
} from "lucide-react";

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export const KODAK_24_LYRICS: LyricLine[] = [
  { time: 0, text: "🎵 (Intro)" },
  { time: 15.0, text: "My name is Kodak but you know that already (My name Kodak)" },
  { time: 19.0, text: "I don't want the wap, baby, I just want the fetty (Boy, you know that)" },
  { time: 23.0, text: "Polo to the socks, homie, this ain't Perry Ellis (Perry Ellis)" },
  { time: 27.0, text: "Let me get the rock, I'ma ball like spaghetti (Like spaghetti)" },
  { time: 31.0, text: "It's getting hot in here, the block be hot, no not Nelly (No not Nelly)" },
  { time: 35.0, text: "You can keep the 'Rari, I'd rather have a Chevy (I bought Chevy)" },
  { time: 39.0, text: "I don't want no head, lately I've been getting becky (They give me becky)" },
  { time: 43.0, text: "I just want the bread, keep the peanut butter jelly (Keep that shit)" },
  { time: 47.0, text: "She walked up to me, I was by the bar, she like hello" },
  { time: 51.0, text: "She rolled up on me, I was rollin' up my cigarillo" },
  { time: 55.0, text: "No, I don't fuck with Grabba leaf, I'm breaking down the elpo" },
  { time: 59.0, text: "I'm always smoking loud, I can't keep it on the L-O" },
  { time: 63.0, text: "Girl, I don't like the way your booty flop, it's like jello" },
  { time: 67.0, text: "And now I'm rockin Robin Jeans, remember wearing Ecko" },
  { time: 71.0, text: "She say she just came to chill, look, bitch, this ain't a Getty" },
  { time: 75.0, text: "I told that bitch get outta here, act like you never met me" },
  { time: 79.0, text: "I'm up the road, I'm lurking for them books, no library" },
  { time: 83.0, text: "Lil' nigga state-to-state, I get more cake than lil' Debbie" },
  { time: 87.0, text: "No, I can't save a ho, I'm no neighborhood hero" },
  { time: 91.0, text: "Keep that shit 1K, I can't be fuckin' with a zero" },
  { time: 95.0, text: "🎵 (Beat Break / Instrumental)" },
  { time: 135.0, text: "My name is Kodak but you know that already (My name Kodak)" },
  { time: 139.0, text: "I don't want the wap, baby, I just want the fetty (Boy, you know that)" },
  { time: 143.0, text: "Polo to the socks, homie, this ain't Perry Ellis (Perry Ellis)" },
  { time: 147.0, text: "Let me get the rock, I'ma ball like spaghetti (Like spaghetti)" },
  { time: 151.0, text: "It's getting hot in here, the block be hot, no not Nelly (No not Nelly)" },
  { time: 155.0, text: "You can keep the 'Rari, I'd rather have a Chevy (I bought Chevy)" },
  { time: 159.0, text: "I don't want no head, lately I've been getting becky (They give me becky)" },
  { time: 163.0, text: "I just want the bread, keep the peanut butter jelly (Keep that shit)" },
  { time: 167.0, text: "🎵 (Verse 2)" },
  { time: 207.0, text: "Boy, I need that green, 'bout my green, no asparagus" },
  { time: 211.0, text: "Lord forgive me please, 'cause the money, I just cherished it" },
  { time: 215.0, text: "Hit a mean lick, I took that money and I buried it" },
  { time: 219.0, text: "She get on her knees, OMG, that's embarrassing" },
  { time: 223.0, text: "I don't need no record deal but you gon' hear my record still" },
  { time: 227.0, text: "Me and DJ on the pill, we spinning like a ferris wheel" },
  { time: 231.0, text: "Oh, that's Kodak Black, who they be talking 'bout, that's the nigga" },
  { time: 235.0, text: "First I had to grow to be the man like a caterpillar" },
  { time: 239.0, text: "Once that jit was old enough to thug it, he was thuggin'" },
  { time: 243.0, text: "He just found a strap now he clutch it like it's nothing" },
  { time: 247.0, text: "I use to pour fours, now I pour a whole dozen" },
  { time: 251.0, text: "Bumped into Lil Wally in the hood, hey, cousin" },
  { time: 255.0, text: "My name is Kodak but you know that already (My name Kodak)" },
  { time: 259.0, text: "I don't want the wap, baby, I just want the fetty (Boy, you know that)" },
  { time: 263.0, text: "Polo to the socks, homie, this ain't Perry Ellis (Perry Ellis)" },
  { time: 267.0, text: "Let me get the rock, I'ma ball like spaghetti (Like spaghetti)" },
  { time: 271.0, text: "It's getting hot in here, the block be hot, no not Nelly (No not Nelly)" },
  { time: 275.0, text: "You can keep the 'Rari, I'd rather have a Chevy (I bought Chevy)" },
  { time: 279.0, text: "I don't want no head, lately I've been getting becky (They give me becky)" },
  { time: 283.0, text: "I just want the bread, keep the peanut butter jelly (Keep that shit)" },
  { time: 287.0, text: "🎵 (Outro)" }
];

interface SyncedLyricsBackgroundProps {
  currentTime: number;
  isPlaying: boolean;
  onSelectTime?: (time: number) => void;
  isFullscreen: boolean;
  opacity: number;
}

export const SyncedLyricsBackground: React.FC<SyncedLyricsBackgroundProps> = ({
  currentTime,
  isPlaying,
  onSelectTime,
  isFullscreen,
  opacity
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Compute which lyric is currently active
  useEffect(() => {
    let index = 0;
    for (let i = 0; i < KODAK_24_LYRICS.length; i++) {
      if (currentTime >= KODAK_24_LYRICS[i].time) {
        index = i;
      } else {
        break;
      }
    }
    setActiveIndex(index);
  }, [currentTime]);

  // Center active lyric on display
  const getLineOffset = () => {
    // Scroll height of each line is roughly 60px on average
    // We adjust the centering translation based on index
    const lineSize = 64; // height of line in pixels
    return `calc(35vh - ${activeIndex * lineSize}px)`;
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden transition-all duration-1000 select-none flex items-center justify-start"
      style={{
        background: isFullscreen 
          ? "rgba(6, 9, 14, 0.5)"
          : "transparent"
      }}
    >
      {/* Decorative ambient audio waveforms */}
      <AnimatePresence>
        {isPlaying && (
          <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none opacity-20 flex justify-around items-end px-12 pb-4 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 md:w-1.5 bg-gradient-to-t from-red-950/40 via-red-800/20 to-transparent rounded-t-full"
                animate={{
                  height: [
                    `${Math.random() * 40 + 10}%`,
                    `${Math.random() * 80 + 20}%`,
                    `${Math.random() * 40 + 10}%`
                  ]
                }}
                transition={{
                  duration: Math.random() * 1.5 + 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating abstract glowing purple/gold balls to match Kobe colors & lyrics theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <motion.div 
          animate={{
            x: ["0%", "10%", "-5%", "0%"],
            y: ["0%", "-10%", "5%", "0%"],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[600px] h-[600px] rounded-full bg-purple-950/10 blur-[130px] -top-40 -left-40" 
        />
        <motion.div 
          animate={{
            x: ["0%", "-15%", "10%", "0%"],
            y: ["0%", "15%", "-10%", "0%"],
            scale: [1, 0.95, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[500px] h-[500px] rounded-full bg-yellow-950/10 blur-[120px] -bottom-20 -right-20" 
        />
      </div>

      {/* Main Lyrics Scroll Carriage */}
      <div 
        className="w-full max-w-5xl mx-auto px-6 md:px-16 lg:px-24 h-full relative z-10 flex flex-col justify-start pt-[20vh] transition-all duration-300 pointer-events-auto"
        style={{
          // Apply blur behind card when not in full focus
          filter: isFullscreen ? "none" : "blur(1.5px) opacity(0.5)",
          transform: isFullscreen ? "scale(1.02) translateZ(0px)" : "scale(0.98) translateZ(-50px)",
        }}
      >
        <div 
          className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none text-left"
          style={{
            transform: `translateY(${getLineOffset()})`,
          }}
        >
          {KODAK_24_LYRICS.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;
            const isUpcoming = idx > activeIndex;

            return (
              <div
                key={idx}
                onClick={() => onSelectTime && onSelectTime(line.time)}
                className={`group py-4 px-3 rounded-2xl cursor-pointer transition-all duration-500 ease-out flex items-start space-x-4 select-none ${
                  isActive 
                    ? "text-white" 
                    : isPassed 
                    ? "text-white/20 hover:text-white/40" 
                    : "text-white/10 hover:text-white/30"
                }`}
                style={{
                  height: "64px"
                }}
              >
                {/* Active arrow indicator on the far left */}
                <div className="w-6 flex items-center justify-center pt-1">
                  {isActive && (
                    <motion.div 
                      layoutId="active-arrow"
                      className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"
                    />
                  )}
                </div>

                {/* Lyrics Text Block with dynamic scale and styling */}
                <div className="flex-1">
                  <span 
                    className={`block font-sans font-extrabold tracking-tight transition-all duration-500 origin-left ${
                      isActive 
                        ? "text-2xl md:text-3xl leading-none scale-102" 
                        : "text-xl md:text-2xl leading-none"
                    }`}
                  >
                    {line.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface MusicPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onUploadFile: (file: File) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isCustomFileLoaded: boolean;
}

export const MusicPlayerControls: React.FC<MusicPlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  isMuted,
  onPlayPause,
  onSeek,
  onToggleMute,
  onUploadFile,
  isFullscreen,
  onToggleFullscreen,
  isCustomFileLoaded
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Format time (e.g. 132s -> 2:12)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-[340px] md:max-w-xl px-4 pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Music player capsule */}
      <div className="w-full bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative group overflow-hidden transition-all duration-300 hover:border-white/20">
        
        {/* Abstract subtle vinyl gradient track background line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-purple-500/20 via-red-500/20 to-yellow-500/20 pointer-events-none" />

        <div className="flex flex-col space-y-3">
          
          {/* Track Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                {isPlaying ? (
                  <div className="flex items-end space-x-0.5 w-4 h-4">
                    <span className="w-0.75 bg-red-500 rounded-full animate-music-bar-1" style={{ height: "40%" }} />
                    <span className="w-0.75 bg-red-500 rounded-full animate-music-bar-2" style={{ height: "100%" }} />
                    <span className="w-0.75 bg-red-500 rounded-full animate-music-bar-3" style={{ height: "60%" }} />
                  </div>
                ) : (
                  <Music className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-white truncate tracking-wider uppercase">
                  24
                </span>
                <span className="text-[10px] font-mono text-zinc-400 truncate tracking-widest uppercase flex items-center space-x-1">
                  <span>Kodak Black</span>
                  {isCustomFileLoaded && (
                    <span className="text-emerald-500 text-[9px] font-sans font-semibold ml-1.5 px-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                      REAL
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* View Mode & Upload Buttons */}
            <div className="flex items-center space-x-2">
              {/* Trigger Input File */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Upload Kodak Black '24.mp3' file"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input 
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Fullscreen Toggle */}
              <button
                onClick={onToggleFullscreen}
                className={`px-3 py-1.5 rounded-full border text-[9px] font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-all duration-300 ${
                  isFullscreen 
                    ? "bg-red-500/10 border-red-500/30 text-red-400" 
                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                }`}
                title={isFullscreen ? "Close Fullscreen Lyrics" : "Fullscreen Lyrics"}
              >
                <span>Lyrics</span>
                {isFullscreen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Progress Seek Slider Row */}
          <div className="space-y-1">
            <div className="relative w-full h-1 group/slider">
              {/* Colored Track Background */}
              <div className="absolute inset-0 bg-zinc-800 rounded-full" />
              <div 
                className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-full group-hover/slider:bg-red-500 transition-colors"
                style={{ width: `${(currentTime / (duration || 225)) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 225}
                step="1"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500 select-none">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || 225)}</span>
            </div>
          </div>

          {/* Controls Hub */}
          <div className="flex items-center justify-between pt-1">
            {/* Left side: Mute trigger */}
            <button
              onClick={onToggleMute}
              className="w-8 h-8 rounded-full border border-white/5 bg-black/40 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-red-500" />
              )}
            </button>

            {/* Core Play buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onSeek(Math.max(0, currentTime - 10))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayPause}
                className="w-12 h-12 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-200"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black stroke-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
                )}
              </button>

              <button 
                onClick={() => onSeek(Math.min(duration || 225, currentTime + 10))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right side status */}
            <div className="w-8 flex justify-end">
              {isCustomFileLoaded ? (
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" title="Custom file playback loaded" />
              ) : (
                <span className="text-[8px] font-mono text-zinc-600 select-none uppercase tracking-widest">SYNTH</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
