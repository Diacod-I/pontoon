"use client";
import { motion } from "motion/react";

interface CardProps {
  index: number;
  isSelected: boolean;
  isTrap: boolean;
  isFlipped: boolean;
  disabled: boolean;
  face: { symbol: string; label: string };
  onClick: () => void;
}

export default function Card({
  isFlipped,
  disabled,
  face,
  onClick,
}: CardProps) {
  return (
    <motion.div
      className="w-16 h-24 cursor-pointer perspective"
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute w-full h-full rounded-lg border-2 border-black bg-white flex items-center justify-center text-2xl font-bold"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span>
            {face.symbol} {face.label}
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full rounded-lg border-2 border-black bg-blue-600 flex items-center justify-center text-white text-3xl font-bold"
          style={{ backfaceVisibility: "hidden" }}
        >
          🎴
        </div>
      </motion.div>
    </motion.div>
  );
}
