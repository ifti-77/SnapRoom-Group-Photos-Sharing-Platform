"use client";

import { useEffect, useState } from "react";

const phrases = [
  "raw photo dumps",
  "chaotic group trips",
  "unfiltered 3am camera rolls",
  "core memories unlocked",
  "disposable cam energy",
  "zero-compression vibes",
];

export default function HeaderTicker() {
  const [index, setIndex] = useState(0);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {

      setIsEntering(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setIsEntering(true);
      }, 250);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-neutral-500 select-none overflow-hidden h-6">
      <span className="hidden sm:inline text-neutral-400">dumping:</span>
      <span
        className={`text-neutral-900 font-semibold transition-all duration-300 ease-out transform ${
          isEntering
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`}
      >
        [{phrases[index]}]
      </span>
    </div>
  );
}