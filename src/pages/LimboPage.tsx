import React, { useState, useEffect, useRef } from 'react';
import BetControls from '../components/ui/BetControls';
import BetHistory from '../components/ui/BetHistory';
import { useWallet } from '../context/WalletContext';
import { getRandomFloat, generateId, delay } from '../utils/gameUtils';
import { TrendingUp, Award } from 'lucide-react';

const LimboPage: React.FC = () => {
  const { subtractBalance, addBalance, addBetRecord } = useWallet();
  const [isBetting, setIsBetting] = useState(false);
  const [targetMultiplier, setTargetMultiplier] = useState(2);
  const [currentMultiplier, setCurrentMultiplier] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the Limbo graph
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Draw background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 1; i < 10; i++) {
      const x = (canvas.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 10; i++) {
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw target multiplier line
    if (targetMultiplier > 1 && targetMultiplier <= 1000) {
      const maxHeight = canvas.height * 0.9;
      const y = maxHeight - (Math.min(Math.log10(targetMultiplier) / 3, 1) * maxHeight);
      
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label the target multiplier
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`${targetMultiplier.toFixed(2)}x`, 10, y - 5);
    }
    
    // Draw current multiplier curve if game is active
    if (isBetting && animationProgress > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const tMax = animationProgress * canvas.width;
      
      for (let x = 0; x <= tMax; x += 2) {
        const progress = x / canvas.width;
        const multiplierValue = Math.exp(progress * 6); // Exponential growth
        
        // Convert multiplier to y position (log scale)
        const maxHeight = canvas.height * 0.9;
        const y = maxHeight - (Math.min(Math.log10(multiplierValue) / 3, 1) * maxHeight);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Draw current multiplier value
      if (currentMultiplier !== null) {
        const currentY = canvas.height * 0.9 - (Math.min(Math.log10(currentMultiplier) / 3, 1) * (canvas.height * 0.9));
        
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(tMax, currentY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Label current value
        ctx.font = '14px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`${currentMultiplier.toFixed(2)}x`, tMax - 10, currentY - 10);
      }
      
      // Show win/lose indication
      if (result !== null) {
        ctx.fillStyle = result === 'win' ? '#10b981' : '#ef4444';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(
          result === 'win' ? 'WIN!' : 'BUST!',
          canvas.width / 2,
          canvas.height / 2
        );
      }
    }
  }, [targetMultiplier, isBetting, animationProgress, currentMultiplier, result]);
  
  const handleTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setTargetMultiplier(value);
  };
  
  // Calculate win probability based on target multiplier
  const calculateWinChance = () => {
    // House edge 2%
    return ((1 / targetMultiplier) * 0.98 * 100).toFixed(2);
  };
  
  const playLimboGame = async (betAmount: number) => {
    if (subtractBalance(betAmount)) {
      setIsBetting(true);
      setResult(null);
      setCurrentMultiplier(1);
      setAnimationProgress(0);
      
      // Determine max multiplier for this round (house edge applied)
      const houseEdge = 0.98; // 2% house edge
      const maxPossibleMultiplier = 1000;
      
      // Random number between 1 and maxPossibleMultiplier with proper distribution
      const randomFloat = getRandomFloat(0, 1);
      const gameMultiplier = Math.min(1 / (randomFloat * houseEdge), maxPossibleMultiplier);
      
      // Determine result
      const isWin = gameMultiplier >= targetMultiplier;
      
      // Animate the multiplier
      const animationDuration = 3000; // 3 seconds
      const startTime = Date.now();
      
      const animate = async () => {
        const elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / animationDuration, 1);
        
        // Use easeOutCubic for a more dramatic effect
        progress = 1 - Math.pow(1 - progress, 3);
        
        setAnimationProgress(progress);
        
        // Calculate current multiplier based on progress
        if (isWin) {
          // If player wins, stop at target multiplier
          setCurrentMultiplier(Math.min(1 + (progress * (targetMultiplier - 1)), targetMultiplier));
        } else {
          // If player loses, stop before target
          setCurrentMultiplier(1 + (progress * (gameMultiplier - 1)));
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation finished
          setResult(isWin ? 'win' : 'lose');
          
          // Add winnings for successful bets
          if (isWin) {
            const winnings = betAmount * targetMultiplier;
            addBalance(winnings);
          }
          
          // Record bet
          addBetRecord({
            id: generateId(),
            game: 'limbo',
            amount: betAmount,
            outcome: isWin ? 'win' : 'lose',
            profit: isWin ? betAmount * (targetMultiplier - 1) : -betAmount,
            timestamp: new Date(),
            details: `Target: ${targetMultiplier}x, Result: ${gameMultiplier.toFixed(2)}x`
          });
          
          await delay(1000);
          setIsBetting(false);
        }
      };
      
      animate();
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Limbo</h1>
        <p className="text-gray-400">Set a target multiplier and test your luck. The higher your target, the bigger the potential win.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-md p-6">
            {/* Target multiplier input */}
            <div className="mb-6">
              <label htmlFor="target-multiplier" className="block text-sm font-medium text-gray-400 mb-1">
                Target Multiplier
              </label>
              <input
                id="target-multiplier"
                type="number"
                step="0.1"
                min="1.1"
                max="1000"
                value={targetMultiplier}
                onChange={handleTargetChange}
                className="input w-full mb-2"
                disabled={isBetting}
              />
              <div className="grid grid-cols-5 gap-2">
                {[1.5, 2, 5, 10, 50].map(value => (
                  <button
                    key={value}
                    className="btn btn-secondary text-xs py-1"
                    onClick={() => setTargetMultiplier(value)}
                    disabled={isBetting}
                  >
                    {value}x
                  </button>
                ))}
              </div>
            </div>
            
            {/* Game stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Win Chance</div>
                <div className="text-xl font-bold">{calculateWinChance()}%</div>
              </div>
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Potential Payout</div>
                <div className="text-xl font-bold">{targetMultiplier}x</div>
              </div>
            </div>
            
            {/* Game visualization */}
            <div className="relative bg-secondary rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-[300px]"
              />
              
              {!isBetting && !result && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <TrendingUp />
                    <span>Place a bet to start</span>
                  </div>
                </div>
              )}
              
              {result === 'win' && (
                <div className="absolute top-4 right-4">
                  <div className="chip bg-win/20 text-win flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Win
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <BetControls onPlaceBet={playLimboGame} disabled={isBetting} />
          <BetHistory />
        </div>
      </div>
    </div>
  );
};

export default LimboPage;