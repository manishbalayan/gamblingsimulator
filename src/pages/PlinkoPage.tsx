import React, { useState, useEffect, useRef } from 'react';
import BetControls from '../components/ui/BetControls';
import BetHistory from '../components/ui/BetHistory';
import { useWallet } from '../context/WalletContext';
import { getRandomNumber, generateId, delay, calculateProfit } from '../utils/gameUtils';

interface PlinkoPin {
  x: number;
  y: number;
  radius: number;
}

interface PlinkoBall {
  x: number;
  y: number;
  radius: number;
  velocity: { x: number; y: number };
  path: string[];
}

const PlinkoPage: React.FC = () => {
  const { subtractBalance, addBalance, addBetRecord } = useWallet();
  const [isBetting, setIsBetting] = useState(false);
  const [result, setResult] = useState<{ multiplier: number; index: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pins, setPins] = useState<PlinkoPin[]>([]);
  const [ball, setBall] = useState<PlinkoBall | null>(null);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [dropAnimation, setDropAnimation] = useState(false);
  
  // Multipliers based on risk level
  const multipliers = {
    low: [3, 2, 1.5, 1.2, 1.1, 1, 1.1, 1.2, 1.5, 2, 3],
    medium: [10, 5, 3, 1.5, 1.2, 1, 1.2, 1.5, 3, 5, 10],
    high: [45, 25, 10, 5, 2, 1.5, 2, 5, 10, 25, 45]
  };
  
  const rows = 12; // Increased rows for better pin distribution
  const buckets = 11;
  
  // Initialize pins with triangular layout
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const pinRadius = 4;
    const startWidth = canvas.width * 0.2; // Narrow at top
    const endWidth = canvas.width * 0.9; // Wider at bottom
    const pinsArray: PlinkoPin[] = [];
    
    for (let row = 0; row < rows; row++) {
      const rowWidth = startWidth + (endWidth - startWidth) * (row / rows);
      const pinSpacingX = rowWidth / (row + 2);
      const offsetX = (canvas.width - rowWidth) / 2;
      const pinSpacingY = (canvas.height - 100) / (rows + 1);
      
      const pinsInRow = row + 2;
      for (let col = 0; col < pinsInRow; col++) {
        pinsArray.push({
          x: offsetX + col * pinSpacingX + pinSpacingX / 2,
          y: (row + 1) * pinSpacingY,
          radius: pinRadius
        });
      }
    }
    
    setPins(pinsArray);
    drawPlinko(ctx, pinsArray, null, []);
  }, []);
  
  // Draw the Plinko board
  const drawPlinko = (
    ctx: CanvasRenderingContext2D, 
    pins: PlinkoPin[], 
    ball: PlinkoBall | null,
    bucketValues: number[]
  ) => {
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw drop animation
    if (dropAnimation && !ball) {
      const centerX = canvas.width / 2;
      const radius = 6;
      const maxHeight = 40;
      const progress = (Date.now() % 1000) / 1000;
      const y = maxHeight * Math.abs(Math.sin(progress * Math.PI));
      
      ctx.beginPath();
      ctx.arc(centerX, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
    
    // Draw pins with glow effect
    pins.forEach(pin => {
      // Pin glow
      const gradient = ctx.createRadialGradient(
        pin.x, pin.y, 0,
        pin.x, pin.y, pin.radius * 3
      );
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
      
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, pin.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Pin
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
    });
    
    // Draw buckets
    const bucketWidth = canvas.width / buckets;
    const bucketY = canvas.height - 30;
    
    for (let i = 0; i < buckets; i++) {
      ctx.fillStyle = i === result?.index ? '#38bdf8' : '#334155';
      ctx.fillRect(i * bucketWidth, bucketY, bucketWidth, 30);
      
      if (bucketValues.length > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '12px Inter';
        ctx.fillText(
          `${bucketValues[i]}x`, 
          i * bucketWidth + bucketWidth / 2, 
          bucketY + 18
        );
      }
    }
    
    // Draw ball with trail effect
    if (ball) {
      // Draw trail
      if (ball.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ball.path[0].split(',')[0], ball.path[0].split(',')[1]);
        for (let i = 1; i < ball.path.length; i++) {
          const [x, y] = ball.path[i].split(',');
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Ball glow
      const ballGradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ball.radius * 2
      );
      ballGradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      ballGradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = ballGradient;
      ctx.fill();
      
      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
  };
  
  // Animation loop for the ball
  const animateBall = async (betAmount: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsBetting(true);
    setResult(null);
    setDropAnimation(false);
    
    const ballRadius = 6;
    const newBall: PlinkoBall = {
      x: canvas.width / 2,
      y: ballRadius,
      radius: ballRadius,
      velocity: { x: 0, y: 0 },
      path: []
    };
    
    setBall(newBall);
    
    // Determine result
    const resultIndex = getRandomNumber(0, buckets - 1);
    const currentMultipliers = multipliers[riskLevel];
    
    // Physics parameters
    const gravity = 0.2;
    const friction = 0.8;
    const elasticity = 0.6;
    const centerAttraction = 0.02; // Force pulling towards center
    
    const simulate = () => {
      // Update velocity
      newBall.velocity.y += gravity;
      
      // Center attraction force
      const centerX = canvas.width / 2;
      const dx = centerX - newBall.x;
      newBall.velocity.x += dx * centerAttraction;
      
      // Update position
      newBall.x += newBall.velocity.x;
      newBall.y += newBall.velocity.y;
      
      // Record path
      newBall.path.push(`${newBall.x},${newBall.y}`);
      if (newBall.path.length > 50) newBall.path.shift();
      
      // Pin collisions
      for (const pin of pins) {
        const dx = newBall.x - pin.x;
        const dy = newBall.y - pin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < newBall.radius + pin.radius) {
          const angle = Math.atan2(dy, dx);
          const targetX = pin.x + Math.cos(angle) * (newBall.radius + pin.radius);
          const targetY = pin.y + Math.sin(angle) * (newBall.radius + pin.radius);
          
          newBall.x = targetX;
          newBall.y = targetY;
          
          newBall.velocity.x = Math.cos(angle) * Math.abs(newBall.velocity.y) * elasticity;
          newBall.velocity.y = Math.sin(angle) * Math.abs(newBall.velocity.y) * elasticity;
          
          // Add randomness
          newBall.velocity.x += (Math.random() - 0.5) * 0.5;
          
          // Apply friction
          newBall.velocity.x *= friction;
          newBall.velocity.y *= friction;
        }
      }
      
      // Boundary checks
      const bucketY = canvas.height - 30;
      if (newBall.y >= bucketY - newBall.radius) {
        const bucketWidth = canvas.width / buckets;
        const currentBucket = Math.floor(newBall.x / bucketWidth);
        
        if (currentBucket !== resultIndex) {
          const targetX = (resultIndex + 0.5) * bucketWidth;
          newBall.velocity.x += (targetX - newBall.x) * 0.1;
        }
        
        if (newBall.y >= bucketY && Math.abs(newBall.velocity.y) < 0.5) {
          return false;
        }
      }
      
      // Keep ball in bounds
      if (newBall.x < newBall.radius) {
        newBall.x = newBall.radius;
        newBall.velocity.x *= -elasticity;
      } else if (newBall.x > canvas.width - newBall.radius) {
        newBall.x = canvas.width - newBall.radius;
        newBall.velocity.x *= -elasticity;
      }
      
      drawPlinko(ctx, pins, newBall, currentMultipliers);
      return true;
    };
    
    while (simulate()) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    // Process results
    const finalMultiplier = currentMultipliers[resultIndex];
    const winnings = betAmount * finalMultiplier;
    const profit = calculateProfit(betAmount, finalMultiplier);
    
    setResult({ multiplier: finalMultiplier, index: resultIndex });
    
    if (finalMultiplier > 0) {
      addBalance(winnings);
    }
    
    addBetRecord({
      id: generateId(),
      game: 'plinko',
      amount: betAmount,
      outcome: finalMultiplier > 1 ? 'win' : 'lose',
      profit: profit,
      timestamp: new Date(),
      details: `${finalMultiplier}x multiplier`
    });
    
    setIsBetting(false);
  };
  
  const handlePlaceBet = (amount: number) => {
    if (subtractBalance(amount)) {
      setDropAnimation(true);
      setTimeout(() => {
        animateBall(amount);
      }, 1000);
    }
  };
  
  // Animate drop indicator
  useEffect(() => {
    if (!canvasRef.current || !dropAnimation) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      if (dropAnimation) {
        drawPlinko(ctx, pins, null, multipliers[riskLevel]);
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [dropAnimation, pins, riskLevel]);
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Plinko</h1>
        <p className="text-gray-400">Watch the ball fall through pins and land on a multiplier.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b border-neutral">
              <button
                className={`flex-1 py-2 text-center ${riskLevel === 'low' ? 'bg-accent text-white' : 'hover:bg-secondary'}`}
                onClick={() => setRiskLevel('low')}
                disabled={isBetting}
              >
                Low Risk
              </button>
              <button
                className={`flex-1 py-2 text-center ${riskLevel === 'medium' ? 'bg-accent text-white' : 'hover:bg-secondary'}`}
                onClick={() => setRiskLevel('medium')}
                disabled={isBetting}
              >
                Medium Risk
              </button>
              <button
                className={`flex-1 py-2 text-center ${riskLevel === 'high' ? 'bg-accent text-white' : 'hover:bg-secondary'}`}
                onClick={() => setRiskLevel('high')}
                disabled={isBetting}
              >
                High Risk
              </button>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-[500px]"
              />
              
              {result && (
                <div className="absolute bottom-10 left-0 right-0 text-center">
                  <div className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${
                    result.multiplier > 1 ? 'bg-win/20 text-win' : 'bg-lose/20 text-lose'
                  }`}>
                    {result.multiplier}x
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <BetControls onPlaceBet={handlePlaceBet} disabled={isBetting} />
          <BetHistory />
        </div>
      </div>
    </div>
  );
};

export default PlinkoPage;