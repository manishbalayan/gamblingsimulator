import React, { useState, useEffect } from 'react';
import BetControls from '../components/ui/BetControls';
import BetHistory from '../components/ui/BetHistory';
import { useWallet } from '../context/WalletContext';
import { getRandomNumber, generateId, delay } from '../utils/gameUtils';

const FlipPage: React.FC = () => {
  const { subtractBalance, addBalance, addBetRecord } = useWallet();
  const [isBetting, setIsBetting] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const flipCoin = async (betAmount: number) => {
    if (subtractBalance(betAmount)) {
      setIsBetting(true);
      setResult(null);
      setIsFlipping(true);
      
      // Determine result
      const randomResult: 'heads' | 'tails' = getRandomNumber(0, 1) === 0 ? 'heads' : 'tails';
      const playerWins = randomResult === selectedSide;
      
      // Animate coin flip
      const flipDuration = 2000;
      const flipsCount = 10;
      const startTime = Date.now();
      
      const animate = async () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / flipDuration, 1);
        
        // Calculate rotation based on progress
        const totalRotation = flipsCount * 180; // 180 degrees per flip
        setRotation(progress * totalRotation);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final rotation shows correct side
          setRotation(randomResult === 'heads' ? 0 : 180);
          setResult(randomResult);
          setIsFlipping(false);
          
          // Process winnings
          if (playerWins) {
            const winnings = betAmount * 1.98; // 2x minus 1% house edge
            addBalance(winnings);
          }
          
          // Record bet
          addBetRecord({
            id: generateId(),
            game: 'flip',
            amount: betAmount,
            outcome: playerWins ? 'win' : 'lose',
            profit: playerWins ? betAmount * 0.98 : -betAmount,
            timestamp: new Date(),
            details: `Selected: ${selectedSide}, Result: ${randomResult}`
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
        <h1 className="text-2xl font-bold mb-2">Coin Flip</h1>
        <p className="text-gray-400">Classic coin flip game. Choose heads or tails and double your bet.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-md p-6">
            {/* Coin selection */}
            <div className="mb-8">
              <p className="text-center text-gray-400 mb-4">Select heads or tails</p>
              <div className="flex justify-center space-x-4">
                <button
                  className={`w-32 py-3 rounded-md flex flex-col items-center ${
                    selectedSide === 'heads' 
                      ? 'bg-accent text-white' 
                      : 'bg-neutral text-white hover:bg-opacity-80'
                  }`}
                  onClick={() => setSelectedSide('heads')}
                  disabled={isBetting}
                >
                  <span className="text-lg font-semibold">Heads</span>
                  <div className="text-xs mt-1">1.98x</div>
                </button>
                <button
                  className={`w-32 py-3 rounded-md flex flex-col items-center ${
                    selectedSide === 'tails' 
                      ? 'bg-accent text-white' 
                      : 'bg-neutral text-white hover:bg-opacity-80'
                  }`}
                  onClick={() => setSelectedSide('tails')}
                  disabled={isBetting}
                >
                  <span className="text-lg font-semibold">Tails</span>
                  <div className="text-xs mt-1">1.98x</div>
                </button>
              </div>
            </div>
            
            {/* Coin animation */}
            <div className="flex justify-center mb-8">
              <div 
                className="w-40 h-40 bg-accent rounded-full relative transition-transform duration-100"
                style={{ 
                  transform: `rotateX(${rotation}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Heads side */}
                <div 
                  className="absolute inset-0 bg-accent border-4 border-accent/40 rounded-full flex items-center justify-center"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(0deg)',
                  }}
                >
                  <div className="text-2xl font-bold text-white">H</div>
                </div>
                
                {/* Tails side */}
                <div 
                  className="absolute inset-0 bg-button border-4 border-button/40 rounded-full flex items-center justify-center"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(180deg)',
                  }}
                >
                  <div className="text-2xl font-bold text-white">T</div>
                </div>
              </div>
            </div>
            
            {/* Result display */}
            {result && !isFlipping && (
              <div className={`p-4 rounded-md text-center font-bold text-lg mb-6 ${
                result === selectedSide 
                  ? 'bg-win/20 text-win' 
                  : 'bg-lose/20 text-lose'
              }`}>
                Result: {result === 'heads' ? 'Heads' : 'Tails'} - 
                {result === selectedSide ? ' You won!' : ' You lost!'}
              </div>
            )}
            
            {isFlipping && (
              <div className="p-4 bg-primary/50 rounded-md text-center mb-6">
                <div className="animate-pulse">Flipping coin...</div>
              </div>
            )}
            
            {!isFlipping && !result && !isBetting && (
              <div className="p-4 bg-primary/50 rounded-md text-center mb-6 text-gray-400">
                Select a side and place your bet
              </div>
            )}
            
            {/* Game stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Win Chance</div>
                <div className="text-xl font-bold">49%</div>
              </div>
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Potential Payout</div>
                <div className="text-xl font-bold">1.98x</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <BetControls onPlaceBet={flipCoin} disabled={isBetting} />
          <BetHistory />
        </div>
      </div>
    </div>
  );
};

export default FlipPage;