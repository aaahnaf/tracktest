import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ value, prefix = '', suffix = '', className = '', duration = 400 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: display % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
