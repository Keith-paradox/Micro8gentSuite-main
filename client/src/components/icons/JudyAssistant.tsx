import React from "react";

interface JudyAssistantProps {
  width?: number;
  height?: number;
  className?: string;
}

const JudyAssistant: React.FC<JudyAssistantProps> = ({ 
  width = 200, 
  height = 200,
  className = "" 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 640 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circular gradient */}
      <circle cx="320" cy="320" r="280" fill="url(#gradient)" />
      
      {/* Face circle */}
      <circle cx="320" cy="320" r="180" fill="#FFFFFF" />
      
      {/* Eyes */}
      <ellipse cx="260" cy="280" rx="20" ry="25" fill="#333333" />
      <ellipse cx="380" cy="280" rx="20" ry="25" fill="#333333" />
      
      {/* Light reflections in eyes */}
      <circle cx="267" cy="270" r="8" fill="white" />
      <circle cx="387" cy="270" r="8" fill="white" />
      
      {/* Smile */}
      <path
        d="M240 360 Q320 420 400 360"
        stroke="#333333"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Hair */}
      <path
        d="M180 220 C200 180 250 150 320 150 C390 150 440 180 460 220 C480 260 480 280 460 300 C440 320 400 320 380 300 C360 280 340 270 320 270 C300 270 280 280 260 300 C240 320 200 320 180 300 C160 280 160 260 180 220Z"
        fill="#555555"
      />
      
      {/* Headset */}
      <path
        d="M140 280 C140 180 220 120 320 120 C420 120 500 180 500 280"
        stroke="#666666"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Headset ear pieces */}
      <rect x="125" y="280" width="15" height="50" rx="5" fill="#666666" />
      <rect x="500" y="280" width="15" height="50" rx="5" fill="#666666" />
      
      {/* Headset microphone */}
      <path
        d="M500 300 C520 300 530 320 520 340 C510 360 490 370 480 350"
        stroke="#666666"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="520" cy="340" r="10" fill="#666666" />
      
      {/* Speech bubbles decoration */}
      <circle cx="180" cy="160" r="20" fill="#F5F5F5" stroke="#888888" strokeWidth="3" />
      <circle cx="150" cy="200" r="15" fill="#F5F5F5" stroke="#888888" strokeWidth="3" />
      <circle cx="130" cy="230" r="10" fill="#F5F5F5" stroke="#888888" strokeWidth="3" />
      
      {/* Digital elements */}
      <circle cx="460" cy="160" r="20" fill="#F5F5F5" stroke="#888888" strokeWidth="3" />
      <rect x="455" y="155" width="10" height="10" fill="#888888" />
      <rect x="455" y="155" width="10" height="2" fill="#F5F5F5" />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="640" y2="640" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default JudyAssistant;