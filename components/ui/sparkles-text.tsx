"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

interface SparklesTextProps {
  /**
   * @default ""
   * @type string
   * @description The text to be displayed
   */
  text: string;

  /**
   * @default 10
   * @type number
   * @description The number of sparkles to be displayed
   */
  sparklesCount?: number;

  /**
   * @default "{first: '#9E7AFF', second: '#FE8BBB'}"
   * @type {first: string, second: string}
   * @description The colors of the sparkles
   */
  colors?: {
    first: string;
    second: string;
  };

  /**
   * @default ""
   * @type string
   * @description Additional classes for the text
   */
  className?: string;

  /**
   * @default ""
   * @type string
   * @description Additional classes for the text span
   */
  textClassName?: string;

  /**
   * @default 2
   * @type number
   * @description The speed of the sparkles
   */
  sparklesSpeed?: number;
}

const SparklesText: React.FC<SparklesTextProps> = ({
  text,
  sparklesCount = 10,
  colors = { first: "#9E7AFF", second: "#FE8BBB" },
  className,
  textClassName = "",
  sparklesSpeed = 2,
  ...props
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkle = (id: string): Sparkle => ({
      id,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      color: Math.random() > 0.5 ? colors.first : colors.second,
      delay: Math.random() * 2,
      scale: Math.random() * 0.7 + 0.3,
      lifespan: Math.random() * 1.5 + 1,
    });

    const initialSparkles = Array.from({ length: sparklesCount }, (_, i) =>
      generateSparkle(i.toString()),
    );
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      setSparkles((prev) =>
        prev.map((s) => (Math.random() > 0.7 ? generateSparkle(s.id) : s)),
      );
    }, 1000 / sparklesSpeed);

    return () => clearInterval(interval);
  }, [colors.first, colors.second, sparklesCount, sparklesSpeed]);

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.svg
            key={sparkle.id}
            className="absolute z-0 pointer-events-none"
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, sparkle.scale, 0],
              rotate: [0, 180],
              left: sparkle.x,
              top: sparkle.y,
            }}
            transition={{
              duration: sparkle.lifespan,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill={sparkle.color}
            />
          </motion.svg>
        ))}
      </AnimatePresence>
      <span className={`relative z-10 ${textClassName}`}>{text}</span>
    </div>
  );
};

export default SparklesText;
