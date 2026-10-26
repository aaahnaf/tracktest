import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Liquid-glass primitives (iOS-27 flavor) + cursor spotlight hooks   */
/* ------------------------------------------------------------------ */

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  glow?: boolean;
}

/**
 * A frosted "liquid glass" card. Tracks the pointer via CSS vars so the
 * sheen highlight follows the cursor, and optionally tilts in 3D.
 */
export function GlassCard({ tilt = true, glow = true, className = '', children, ...rest }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    if (tilt) {
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) * 8;
      setTiltStyle({ transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.012)` });
    }
  };

  const reset = () => {
    setTiltStyle({});
    const el = ref.current;
    if (el) {
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '-20%');
    }
  };

  return (
    <motion.div
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full"
      style={{ perspective: '900px' }}
    >
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{ ...tiltStyle, ...(glow ? {} : {}) }}
        className={`glass-card ${className}`}
        {...(rest as any)}
      >
        {children}
      </div>
    </motion.div>
  );
}

/** Small technical label with an accent dot — matches the original monochrome system */
export function TechLabel({
  children,
  accent = false,
  className = '',
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent ? 'bg-[var(--accent)]' : 'bg-[var(--text-primary)]'}`}
      />
      <span className="technical-text text-[var(--text-secondary)]">{children}</span>
    </div>
  );
}

/** Pill button rendered as liquid glass */
export function GlassPill({
  active = false,
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={`glass-pill ${active ? 'glass-pill-active' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

/** Primary CTA — solid ink capsule with a specular sweep on hover */
export function InkButton({
  children,
  className = '',
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={(e) => {
        // burst handled by caller; stop propagation not needed
        onClick?.(e);
      }}
      {...(rest as any)}
      className={`ink-button group relative overflow-hidden ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <span className="sheen-sweep" aria-hidden />
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Spotlight hook — sets page-level CSS vars for the cursor glow      */
/* ------------------------------------------------------------------ */

export function useSpotlight() {
  useEffect(() => {
    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.35;
    let cx = tx;
    let cy = ty;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      document.documentElement.style.setProperty('--spot-x', `${cx}px`);
      document.documentElement.style.setProperty('--spot-y', `${cy}px`);
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Magnetic wrapper — buttons/nav items lean toward the cursor        */
/* ------------------------------------------------------------------ */

export function Magnetic({
  strength = 0.35,
  children,
  className = '',
}: {
  strength?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`magnetic ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Staggered reveal container                                         */
/* ------------------------------------------------------------------ */

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const riseChild = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};
