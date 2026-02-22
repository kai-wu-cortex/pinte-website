
import React from 'react';

interface PinteLogoProps {
  className?: string;
  originalColors?: boolean;
}

export const PinteLogo: React.FC<PinteLogoProps> = ({ className, originalColors = false }) => {
  // Color 1: Grey parts (#5B5959)
  const color1 = originalColors ? "#5B5959" : "currentColor";
  // Color 2: Black parts
  const color2 = originalColors ? "black" : "currentColor";

  return (
    <svg 
      width="31" 
      height="27" 
      viewBox="0 0 31 27" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect y="8.85715" width="4.57143" height="18.2857" fill={color1}/>
      <rect x="18.2857" y="19.4286" width="4.57143" height="7.71428" fill={color1}/>
      <path d="M18.2857 0V0C21.4416 0 24 2.55837 24 5.71428V8.85714H18.2857V0Z" fill={color2}/>
      <rect x="9.14285" y="8.85715" width="4.57143" height="18.2857" fill={color2}/>
      <path d="M13.7143 13.1429L13.7143 8.85714L24 8.85714V8.85714C24 11.2241 22.0812 13.1429 19.7143 13.1429L13.7143 13.1429Z" fill={color2}/>
      <path d="M0 4.57141L-1.99823e-07 -1.43051e-05L18.2857 -1.51044e-05L18.2857 4.57141L0 4.57141Z" fill={color2}/>
    </svg>
  );
};


export default PinteLogo;
