export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export interface AnimateOptions {
  x?: number | (() => number);
  y?: number | (() => number);
  rotate?: number | (() => number);
  duration?: number | (() => number);
  composition?: string;
}

export const animate = (selector: string, options: AnimateOptions = {}) => {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const targetX = typeof options.x === 'function' ? options.x() : options.x ?? random(-100, 100);
    const targetY = typeof options.y === 'function' ? options.y() : options.y ?? random(-100, 100);
    const targetRotate = typeof options.rotate === 'function' ? options.rotate() : options.rotate ?? random(-180, 180);
    const targetDuration = typeof options.duration === 'function' ? options.duration() : options.duration ?? random(500, 1000);

    let compositeMode: CompositeOperation = 'replace';
    if (options.composition === 'add') compositeMode = 'add';
    else if (options.composition === 'accumulate') compositeMode = 'accumulate';

    try {
      htmlEl.animate(
        [
          { transform: htmlEl.style.transform || 'translate(0px, 0px) rotate(0deg)' },
          { transform: `translate(${targetX}px, ${targetY}px) rotate(${targetRotate}deg)` }
        ],
        {
          duration: targetDuration,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'forwards',
          composite: compositeMode
        }
      );
    } catch {
      // Safe fallback for un-supported DOM animation options
    }
  });
};

export const stagger = (val: number) => {
  return (index: number) => index * val;
};

export class Timeline {
  add(selector: string, keyframesOptions: Record<string, any>, staggerOption?: any) {
    if (typeof document === 'undefined') return this;

    const elements = document.querySelectorAll(selector);
    const getStagger = typeof staggerOption === 'function' ? staggerOption : () => (typeof staggerOption === 'number' ? staggerOption : 0);

    elements.forEach((el, idx) => {
      const htmlEl = el as HTMLElement;
      const delay = getStagger(idx);

      const xVals = Array.isArray(keyframesOptions.x) ? keyframesOptions.x : [keyframesOptions.x ?? 0];
      const yVals = Array.isArray(keyframesOptions.y) ? keyframesOptions.y : [keyframesOptions.y ?? 0];

      const stepsCount = Math.max(xVals.length, yVals.length);
      const keyframeSteps = [];

      for (let i = 0; i < stepsCount; i++) {
        const x = xVals[i % xVals.length] ?? 0;
        const y = yVals[i % yVals.length] ?? 0;
        keyframeSteps.push({
          transform: `translate(${x}px, ${y}px)`
        });
      }

      try {
        htmlEl.animate(keyframeSteps, {
          duration: 1800,
          delay,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out',
          fill: 'both'
        });
      } catch {
        // Safe fallback
      }
    });

    return this;
  }
}

export const createTimeline = () => new Timeline();

export interface ScopeOptions {
  mediaQueries?: Record<string, string>;
}

export const createScope = (options: ScopeOptions = {}) => {
  return {
    add: (fn: (ctx: { matches: Record<string, boolean> }) => void) => {
      if (typeof window === 'undefined') return;

      const evalMatches = () => {
        const matches: Record<string, boolean> = {};
        if (options.mediaQueries) {
          for (const [key, query] of Object.entries(options.mediaQueries)) {
            matches[key] = window.matchMedia(query).matches;
          }
        }
        return matches;
      };

      const run = () => fn({ matches: evalMatches() });
      run();

      window.addEventListener('resize', run);
    }
  };
};
