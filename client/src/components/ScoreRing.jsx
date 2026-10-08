import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export default function ScoreRing({ value = 0, size = 190, label }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMotionValue(0);
  const offset = useTransform(progress, (p) => circumference * (1 - p / 100));
  const shown = useTransform(progress, (p) => Math.round(p));

  useEffect(() => {
    const controls = animate(progress, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, progress]);

  const tone = value >= 75 ? 'var(--mint)' : value >= 50 ? 'var(--cyan)' : value >= 25 ? 'var(--amber)' : 'var(--rose)';

  return (
    <div className="ring" style={{ width: size, height: size, '--tone': tone }} role="img" aria-label={`${label}: ${value} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <motion.circle
          className="ring-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="ring-center">
        <motion.strong>{shown}</motion.strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
