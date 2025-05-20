import { useEffect, useState, useRef, FC } from 'react';
import { Box, keyframes } from '@mui/material';

const DOTS = {
  1: ['center'],
  2: ['top-left', 'bottom-right'],
  3: ['top-left', 'center', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
} as const;

const dotPositions = {
  'top-left': { top: '25%', left: '25%' },
  'top-right': { top: '25%', right: '25%' },
  'middle-left': { top: '50%', left: '25%', transform: 'translate(-50%, -50%)' },
  'middle-right': { top: '50%', right: '25%', transform: 'translate(50%, -50%)' },
  'bottom-left': { bottom: '25%', left: '25%' },
  'bottom-right': { bottom: '25%', right: '25%' },
  'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
};

const rollAnimation = keyframes`
  0% { transform: rotate(0deg) translateZ(0); }
  25% { transform: rotate(90deg) translateZ(0); }
  50% { transform: rotate(180deg) translateZ(0); }
  75% { transform: rotate(270deg) translateZ(0); }
  100% { transform: rotate(360deg) translateZ(0); }
`;

interface DiceProps {
  value: number;
  size?: number;
  isRolling?: boolean;
  color?: string;
}

const Dice: FC<DiceProps> = ({ 
  value, 
  size = 60, 
  isRolling = false, 
  color = '#333' 
}) => {
  const [displayValue, setDisplayValue] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  // Using any type as a last resort due to TypeScript timer type issues
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  // Handle the rolling animation
  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true);
      
      // Generate random values during the roll
      intervalRef.current = window.setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      
      // Stop rolling after 1 second and show the final value
      timeoutRef.current = window.setTimeout(() => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayValue(value);
        setIsAnimating(false);
      }, 1000);
      
      // Cleanup function
      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    } else {
      // Update display value when not rolling
      setDisplayValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling, value, setDisplayValue, setIsAnimating]);

  const dots = DOTS[displayValue as keyof typeof DOTS] || [];

  return (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: 'white',
        borderRadius: '10%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: isAnimating ? `${rollAnimation} 1s ease-out` : 'none',
        transformStyle: 'preserve-3d',
        transform: isAnimating ? 'rotateY(360deg)' : 'none',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {dots.map((position, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: '50%',
            backgroundColor: color,
            ...dotPositions[position as keyof typeof dotPositions],
          }}
        />
      ))}
    </Box>
  );
};

export default Dice;
