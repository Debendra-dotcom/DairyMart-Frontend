import { useRef, useState } from "react";

export default function HeroBottle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -8, y: dx * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="hero-bottle-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Soft circular glow behind bottle */}
      <div className="hero-bottle-glow" aria-hidden="true" />

      {/* Realistic shadow below bottle */}
      <div className="hero-bottle-shadow" aria-hidden="true" />

      {/* Bottle image with 3D tilt */}
      <div
        className="hero-bottle-inner"
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1)`,
        }}
      >
        <img
          src="/sr-bottle.png"
          alt="SR Dairy bottle"
          className="hero-bottle-img"
          draggable={false}
        />
      </div>
    </div>
  );
}

