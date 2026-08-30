import { useEffect, useState, useRef } from 'react';

type Props = {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
};

export function AnimatedNumber({ value, duration = 1000, formatter }: Props) {
  // Pula a animação nos testes do vitest/jest
  const isTest = import.meta.env.MODE === 'test';
  
  const [currentValue, setCurrentValue] = useState(isTest ? value : 0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(isTest ? value : 0);

  useEffect(() => {
    if (isTest) {
      setCurrentValue(value);
      return;
    }

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

  const formatted = formatter 
    ? formatter(currentValue)
    : (value % 1 !== 0 
      ? currentValue.toFixed(2).replace('.', ',')
      : Math.round(currentValue).toString());

  return <span>{formatted}</span>;
}
