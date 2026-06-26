import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { X, Heart, Zap, MapPin, MessageCircle, User, RotateCcw } from "lucide-react";

const PROFILES = [
  {
    id: 1,
    name: "Sofia",
    age: 26,
    distance: "2 miles away",
    bio: "Architect by day, jazz lover by night. Let's get lost in the city together.",
    photo: "https://images.unsplash.com/photo-1715619044226-b693312ffb9b?w=600&h=820&fit=crop&auto=format",
    tags: ["Architecture", "Jazz", "Coffee"],
    verified: true,
  },
  {
    id: 2,
    name: "Camille",
    age: 28,
    distance: "5 miles away",
    bio: "Photographer and lover of late nights. I know every rooftop bar in this city.",
    photo: "https://images.unsplash.com/photo-1706153068774-5271417921a4?w=600&h=820&fit=crop&auto=format",
    tags: ["Photography", "Rooftops", "Film"],
    verified: false,
  },
  {
    id: 3,
    name: "Marcus",
    age: 29,
    distance: "1 mile away",
    bio: "Streetwear designer. I'll take you thrift shopping and turn it into a date.",
    photo: "https://images.unsplash.com/photo-1613419441661-6a5af1751d30?w=600&h=820&fit=crop&auto=format",
    tags: ["Design", "Streetwear", "Vintage"],
    verified: true,
  },
  {
    id: 4,
    name: "Jade",
    age: 24,
    distance: "4 miles away",
    bio: "Ceramicist. I'll teach you to throw pottery if you teach me something new.",
    photo: "https://images.unsplash.com/photo-1767041573030-38b34bbe830e?w=600&h=820&fit=crop&auto=format",
    tags: ["Ceramics", "Art", "Plants"],
    verified: false,
  },
  {
    id: 5,
    name: "Luca",
    age: 25,
    distance: "3 miles away",
    bio: "Chef at a small Italian spot. Sundays are for farmers markets and long dinners.",
    photo: "https://images.unsplash.com/photo-1525457136159-8878648a7ad0?w=600&h=820&fit=crop&auto=format",
    tags: ["Cooking", "Markets", "Italy"],
    verified: true,
  },
  {
    id: 6,
    name: "Aria",
    age: 27,
    distance: "7 miles away",
    bio: "Music producer and chronic night owl. The best conversations happen after midnight.",
    photo: "https://images.unsplash.com/photo-1758613172261-d8281aa72a92?w=600&h=820&fit=crop&auto=format",
    tags: ["Music", "Nightlife", "Studios"],
    verified: false,
  },
];

const SWIPE_THRESHOLD = 90;
const EXIT_VELOCITY_THRESHOLD = 400;

interface Profile {
  id: number;
  name: string;
  age: number;
  distance: string;
  bio: string;
  photo: string;
  tags: string[];
  verified: boolean;
}

interface SwipeCardProps {
  profile: Profile;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (dir: "left" | "right") => void;
  programmaticSwipe: { dir: "left" | "right"; ts: number } | null;
}

function SwipeCard({ profile, isTop, stackIndex, onSwipe, programmaticSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-280, 0, 280], [-22, 0, 22]);
  const likeOpacity = useTransform(x, [25, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -25], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);
  const isExiting = useRef(false);

  const scale = 1 - stackIndex * 0.045;
  const cardY = stackIndex * -18;

  useEffect(() => {
    if (!programmaticSwipe || !isTop || isExiting.current) return;
    isExiting.current = true;
    const exitX = programmaticSwipe.dir === "right" ? 1600 : -1600;
    animate(x, exitX, { duration: 0.38, ease: [0.4, 0, 0.2, 1] }).then(() => {
      onSwipe(programmaticSwipe.dir);
    });
  }, [programmaticSwipe]);

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (isExiting.current) return;
    const { offset, velocity } = info;

    if (offset.x > SWIPE_THRESHOLD || velocity.x > EXIT_VELOCITY_THRESHOLD) {
      isExiting.current = true;
      animate(x, 1600, { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }).then(() =>
        onSwipe("right")
      );
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -EXIT_VELOCITY_THRESHOLD) {
      isExiting.current = true;
      animate(x, -1600, { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }).then(() =>
        onSwipe("left")
      );
    } else {
      animate(x, 0, { type: "spring", stiffness: 420, damping: 28 });
      animate(y, 0, { type: "spring", stiffness: 420, damping: 28 });
    }
  }

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 top-0 rounded-[28px] overflow-hidden bg-[#1A1310]"
      animate={{ scale, y: cardY }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      style={
        isTop
          ? { x, y, rotate, opacity: cardOpacity, zIndex: 20, cursor: "grab" }
          : { zIndex: 20 - stackIndex }
      }
      {...(isTop
        ? {
            drag: true,
            dragElastic: 0.65,
            dragConstraints: { left: -1500, right: 1500, top: -600, bottom: 600 },
            onDragEnd: handleDragEnd,
            whileTap: { cursor: "grabbing" },
          }
        : {})}
    >
      {/* Photo */}
      <img
        src={profile.photo}
        alt={`${profile.name}, ${profile.age}`}
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" style={{ height: "30%" }} />

      {/* Like stamp */}
      {isTop && (
        <motion.div
          className="absolute top-10 left-5 z-30 border-[3px] border-[#4ADE80] rounded-xl px-4 py-1.5 rotate-[-14deg] pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-[#4ADE80] font-bold text-2xl tracking-[0.15em] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Like
          </span>
        </motion.div>
      )}

      {/* Nope stamp */}
      {isTop && (
        <motion.div
          className="absolute top-10 right-5 z-30 border-[3px] border-[#F87171] rounded-xl px-4 py-1.5 rotate-[14deg] pointer-events-none"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-[#F87171] font-bold text-2xl tracking-[0.15em] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Nope
          </span>
        </motion.div>
      )}

      {/* Card info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-7">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h2
                className="text-white text-[2rem] leading-none font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {profile.name}, {profile.age}
              </h2>
              {profile.verified && (
                <div className="w-5 h-5 rounded-full bg-[#E8885A] flex items-center justify-center flex-shrink-0 mb-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-white/55 text-sm mt-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{profile.distance}</span>
            </div>
          </div>
        </div>

        <p className="text-white/75 text-[0.875rem] leading-relaxed mb-3.5 line-clamp-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {profile.bio}
        </p>

        <div className="flex gap-2 flex-wrap">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-white/70 border border-white/20 rounded-full px-3 py-1 bg-white/5 backdrop-blur-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(PROFILES);
  const [matchOverlay, setMatchOverlay] = useState<Profile | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [programmaticSwipe, setProgrammaticSwipe] = useState<{ dir: "left" | "right"; ts: number } | null>(null);
  const [history, setHistory] = useState<Profile[]>([]);

  function handleSwipe(dir: "left" | "right") {
    const swipedProfile = profiles[0];
    setHistory((prev) => [...prev, swipedProfile]);
    setProfiles((prev) => prev.slice(1));

    if (dir === "right" && Math.random() > 0.55) {
      setMatchCount((c) => c + 1);
      setTimeout(() => {
        setMatchOverlay(swipedProfile);
      }, 400);
    }
  }

  function triggerSwipe(dir: "left" | "right") {
    if (profiles.length === 0) return;
    setProgrammaticSwipe({ dir, ts: Date.now() });
  }

  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setProfiles((prev) => [last, ...prev]);
  }

  function resetDeck() {
    setProfiles(PROFILES);
    setHistory([]);
  }

  const visibleProfiles = profiles.slice(0, 3);

  return (
    <div
      className="h-screen w-full flex flex-col items-center overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #140E0C 0%, #0C0A09 50%, #0A0C10 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[400px] px-5 pt-8 pb-4 flex-shrink-0">
        <button className="w-11 h-11 rounded-full border border-white/8 bg-white/4 flex items-center justify-center hover:bg-white/8 transition-colors">
          <User className="w-5 h-5 text-white/50" />
        </button>

        <div className="flex flex-col items-center">
          <span
            className="text-white text-2xl font-bold tracking-tight leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            spark
          </span>
          <span
            className="text-[#E8885A]/70 text-[11px] tracking-widest uppercase mt-0.5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {profiles.length > 0 ? `${profiles.length} nearby` : "no one nearby"}
          </span>
        </div>

        <button className="w-11 h-11 rounded-full border border-white/8 bg-white/4 flex items-center justify-center hover:bg-white/8 transition-colors relative">
          <MessageCircle className="w-5 h-5 text-white/50" />
          {matchCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8885A] rounded-full text-[10px] font-bold text-black flex items-center justify-center"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {matchCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Card Stack Area */}
      <div className="relative w-full max-w-[400px] flex-1 px-5 min-h-0">
        <div className="relative w-full h-full">
          {profiles.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="w-24 h-24 rounded-full border border-[#E8885A]/20 bg-[#E8885A]/5 flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#E8885A]/60" />
              </div>
              <div className="text-center">
                <p className="text-white/80 font-medium text-lg mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  You've seen everyone
                </p>
                <p className="text-white/40 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Come back later or reset the deck
                </p>
              </div>
              <button
                onClick={resetDeck}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E8885A]/30 bg-[#E8885A]/10 text-[#E8885A] text-sm hover:bg-[#E8885A]/20 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset deck
              </button>
            </div>
          ) : (
            [...visibleProfiles].reverse().map((profile, reversedIndex) => {
              const stackIndex = visibleProfiles.length - 1 - reversedIndex;
              const isTop = stackIndex === 0;
              return (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  isTop={isTop}
                  stackIndex={stackIndex}
                  onSwipe={handleSwipe}
                  programmaticSwipe={isTop ? programmaticSwipe : null}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 w-full max-w-[400px] px-5 py-6 flex-shrink-0">
        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className="w-12 h-12 rounded-full border border-white/8 bg-white/4 flex items-center justify-center hover:bg-white/8 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-5 h-5 text-[#FCD34D]" />
        </button>

        {/* Nope */}
        <button
          onClick={() => triggerSwipe("left")}
          disabled={profiles.length === 0}
          className="w-16 h-16 rounded-full border border-[#F87171]/25 bg-[#F87171]/8 flex items-center justify-center hover:bg-[#F87171]/18 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          style={{ boxShadow: "0 4px 24px rgba(248, 113, 113, 0.1)" }}
        >
          <X className="w-7 h-7 text-[#F87171]" />
        </button>

        {/* Super Like */}
        <button
          disabled={profiles.length === 0}
          className="w-12 h-12 rounded-full border border-[#E8885A]/30 bg-[#E8885A]/8 flex items-center justify-center hover:bg-[#E8885A]/18 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 4px 16px rgba(232, 136, 90, 0.12)" }}
        >
          <Zap className="w-5 h-5 text-[#E8885A]" />
        </button>

        {/* Like */}
        <button
          onClick={() => triggerSwipe("right")}
          disabled={profiles.length === 0}
          className="w-16 h-16 rounded-full border border-[#4ADE80]/25 bg-[#4ADE80]/8 flex items-center justify-center hover:bg-[#4ADE80]/18 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 4px 24px rgba(74, 222, 128, 0.1)" }}
        >
          <Heart className="w-7 h-7 text-[#4ADE80]" />
        </button>
      </div>

      {/* Match overlay */}
      {matchOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => setMatchOverlay(null)}
        >
          <motion.div
            initial={{ scale: 0.75, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.05 }}
            className="flex flex-col items-center px-8 text-center"
          >
            {/* Overlapping avatars */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#0C0A09] -mr-4 relative z-10 shadow-xl">
                <img
                  src={matchOverlay.photo}
                  alt={matchOverlay.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#0C0A09] -ml-4 shadow-xl bg-[#2A2420] flex items-center justify-center">
                <User className="w-10 h-10 text-white/30" />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(232,136,90,0.15) 0%, transparent 70%)" }} />
            </div>

            <p
              className="text-[#E8885A] text-sm tracking-[0.25em] uppercase mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              It's a match
            </p>
            <h2
              className="text-white text-4xl font-bold mb-3 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              You & {matchOverlay.name}
            </h2>
            <p
              className="text-white/45 text-sm leading-relaxed mb-8 max-w-[240px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              You both liked each other. Start a conversation before the moment passes.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <button
                className="w-full py-3.5 rounded-2xl bg-[#E8885A] text-[#0C0A09] font-semibold text-base hover:bg-[#E07840] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setMatchOverlay(null)}
              >
                Send a message
              </button>
              <button
                className="w-full py-3.5 rounded-2xl border border-white/10 text-white/60 text-base hover:bg-white/5 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setMatchOverlay(null)}
              >
                Keep swiping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
