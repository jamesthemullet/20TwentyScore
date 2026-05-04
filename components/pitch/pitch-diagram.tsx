import React from 'react';

export default function PitchDiagram() {
  const cx = 110;
  const cy = 110;

  return (
    <svg
      viewBox="0 0 220 220"
      width="220"
      height="220"
      aria-label="Cricket ground diagram"
      style={{ display: 'block' }}>

      {/* Outfield */}
      <circle cx={cx} cy={cy} r="108" fill="#5a9e3a" stroke="#4a8530" strokeWidth="1.5" />

      {/* Inner circle (30-yard) */}
      <circle cx={cx} cy={cy} r="66" fill="none" stroke="#4a8530" strokeWidth="1" strokeDasharray="5 4" opacity="0.6" />

      {/* Pitch strip — vertical rectangle centred */}
      <rect x="104" y="62" width="12" height="96" fill="#c9a96e" stroke="#a87f4a" strokeWidth="0.8" />

      {/* Top end creases */}
      <line x1="100" y1="76" x2="120" y2="76" stroke="#fff" strokeWidth="1.2" />
      <line x1="98"  y1="81" x2="122" y2="81" stroke="#fff" strokeWidth="1.2" />
      <line x1="104" y1="76" x2="104" y2="81" stroke="#fff" strokeWidth="1.2" />
      <line x1="116" y1="76" x2="116" y2="81" stroke="#fff" strokeWidth="1.2" />

      {/* Top stumps */}
      <line x1="107" y1="76" x2="107" y2="69" stroke="#5c3a1e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="110" y1="76" x2="110" y2="69" stroke="#5c3a1e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="113" y1="76" x2="113" y2="69" stroke="#5c3a1e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="106" y1="69" x2="109" y2="69" stroke="#5c3a1e" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="111" y1="69" x2="114" y2="69" stroke="#5c3a1e" strokeWidth="1.2" strokeLinecap="round" />

      {/* Bottom end creases */}
      <line x1="100" y1="144" x2="120" y2="144" stroke="#fff" strokeWidth="1.2" />
      <line x1="98"  y1="139" x2="122" y2="139" stroke="#fff" strokeWidth="1.2" />
      <line x1="104" y1="144" x2="104" y2="139" stroke="#fff" strokeWidth="1.2" />
      <line x1="116" y1="144" x2="116" y2="139" stroke="#fff" strokeWidth="1.2" />

      {/* Bottom stumps */}
      <line x1="107" y1="144" x2="107" y2="151" stroke="#5c3a1e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="110" y1="144" x2="110" y2="151" stroke="#5c3a1e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="113" y1="144" x2="113" y2="151" stroke="#5c3a1e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="106" y1="151" x2="109" y2="151" stroke="#5c3a1e" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="111" y1="151" x2="114" y2="151" stroke="#5c3a1e" strokeWidth="1.2" strokeLinecap="round" />

      {/* Centre spot */}
      <circle cx={cx} cy={cy} r="1.5" fill="#a87f4a" />
    </svg>
  );
}
