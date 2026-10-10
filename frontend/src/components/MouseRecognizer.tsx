import React, { useEffect, useRef, useState } from 'react';

export const MouseRecognizer: React.FC = () => {
  const followerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on pointer-accurate non-reduced-motion devices
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isTouch) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, select, input, [role="button"], .cursor-pointer');
        setIsHoveringInteractive(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth 60/120fps LERP loop for silky cursor movement
    const animate = () => {
      // 0.18 interpolation factor gives fluid responsiveness without noticeable latency
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <>
      {/* Ambient Spotlight that highlights cards and borders under mouse */}
      <div
        ref={spotlightRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,rgba(13,148,136,0.03)_40%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,rgba(20,184,166,0.05)_40%,transparent_70%)] blur-2xl" />
      </div>

      {/* Fluid Mouse Recognizer & Ring Follower */}
      <div
        ref={followerRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Core Dot Indicator */}
        <div
          className={`w-2 h-2 rounded-full transition-all duration-200 ease-out ${
            isClicking
              ? 'scale-50 bg-teal-500 dark:bg-teal-400'
              : isHoveringInteractive
              ? 'scale-125 bg-indigo-600 dark:bg-teal-400 ring-4 ring-indigo-500/20 dark:ring-teal-400/20'
              : 'bg-indigo-500 dark:bg-indigo-400 opacity-80'
          }`}
        />

        {/* Outer Reactive Ring */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ease-out ${
            isClicking
              ? 'w-10 h-10 border-teal-500/80 scale-90 opacity-90'
              : isHoveringInteractive
              ? 'w-11 h-11 border-indigo-500/70 dark:border-teal-400/70 bg-indigo-500/5 dark:bg-teal-400/5 scale-110 shadow-sm'
              : 'w-7 h-7 border-slate-400/40 dark:border-slate-500/40 opacity-40 scale-100'
          }`}
        />
      </div>
    </>
  );
};
