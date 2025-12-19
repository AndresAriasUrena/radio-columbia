'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';

interface RotatingTextProps {
  text: string[];
  duration?: number;
  transition?: Transition;
  className?: string;
}

export function RotatingText({
  text,
  duration = 3000,
  transition = { duration: 0.5, ease: 'easeInOut' },
  className = ''
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % text.length);
    }, duration);

    return () => clearInterval(interval);
  }, [text.length, duration]);

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={transition}
          className="inline-block"
        >
          {text[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
