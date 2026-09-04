import { useEffect, useState, useRef } from 'react';

type Props = {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
};

export function AnimatedNumber({ value, duration = 1000, formatter }: Props) {
  // Pula a animação nos testes do vitest/jest
  const isTest = import.meta.env.MODE === 'test';
  
  const [currentValue, setCurrentValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    if (isTest) return;

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCurrentValue(startValue.current + (value - startValue.current) * easeProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        startValue.current = value;
        startTime.current = null;
      }
    };

    if (value !== startValue.current) {
      startTime.current = null;
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, isTest]);

  const displayValue = isTest ? value : currentValue;

  const formatted = formatter
    ? formatter(displayValue)
    : (value % 1 !== 0
      ? displayValue.toFixed(2).replace('.', ',')
      : Math.round(displayValue).toString());

  return <span>{formatted}</span>;
}
