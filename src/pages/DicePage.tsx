import React, { useState } from 'react';
import BetControls from '../components/ui/BetControls';
import BetHistory from '../components/ui/BetHistory';
import { useWallet } from '../context/WalletContext';
import { getRandomFloat, generateId, calculateProfit } from '../utils/gameUtils';
import { ArrowBigDown, ArrowBigUp, RotateCcw } from 'lucide-react';

const DicePage: React.FC = () => {
  const { subtractBalance, addBalance, addBetRecord } = useWallet();
  const [isBetting, setIsBetting] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [targetValue, setTargetValue] = useState(50);
  const [betType, setBetType] = useState<'over' | 'under'>('over');
  const [winChance, setWinChance] = useState(49.5);
  const [multiplier, setMultiplier] = useState(2.0);
  
  // Calculate win chance and multiplier based on target value and bet type
  const updateProbabilityAndMultiplier = (value: number, type: 'over' | 'under') => {
    let chance;
    if (type === 'over') {
      chance = 100 - value;
    } else {
      chance = value;
    }
    
    // Adjust for house edge (2%)
    chance = chance - (chance * 0.02);
    
    // Calculate fair multiplier with house edge
    const multiplier = 99 / chance;
    
    setWinChance(Number(chance.toFixed(2)));
    setMultiplier(Number(multiplier.toFixed(2)));
  };
  
  // Update values when target or bet type changes
  const handleTargetChange = (value: number) => {
    setTargetValue(value);
    updateProbabilityAndMultiplier(value, betType);
  };
  
  const handleBetTypeChange = (type: 'over' | 'under') => {
    setBetType(type);
    updateProbabilityAndMultiplier(targetValue, type);
  };
  
  const handlePlaceBet = async (amount: number) => {
    if (subtractBalance(amount)) {
      setIsBetting(true);
      setResult(null);
      
      // Random roll between 0 and 100
      const roll = getRandomFloat(0, 100);
      
      // Check if win based on bet type
      let isWin = false;
      if (betType === 'over' && roll > targetValue) {
        isWin = true;
      } else if (betType === 'under' && roll < targetValue) {
        isWin = true;
      }
      
      // Simulate dice roll animation
      const animateRoll = async () => {
        for (let i = 0; i < 20; i++) {
          setResult(Number(getRandomFloat(0, 100).toFixed(2)));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        setResult(Number(roll.toFixed(2)));
      };
      
      await animateRoll();
      
      // Process winnings
      const profit = isWin ? calculateProfit(amount, multiplier) : -amount;
      if (isWin) {
        addBalance(amount * multiplier);
      }
      
      // Record bet
      addBetRecord({
        id: generateId(),
        game: 'dice',
        amount: amount,
        outcome: isWin ? 'win' : 'lose',
        profit: profit,
        timestamp: new Date(),
        details: `Roll: ${roll.toFixed(2)}, Target: ${betType === 'over' ? '>' : '<'} ${targetValue}`
      });
      
      setIsBetting(false);
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dice</h1>
        <p className="text-gray-400">Predict whether the roll will be higher or lower than your chosen number.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-md p-6">
            {/* Bet type selector */}
            <div className="flex mb-6">
              <button
                className={`flex-1 py-3 rounded-l-md flex items-center justify-center ${
                  betType === 'under' ? 'bg-accent text-white' : 'bg-neutral text-white hover:bg-opacity-80'
                }`}
                onClick={() => handleBetTypeChange('under')}
                disabled={isBetting}
              >
                <ArrowBigDown className="mr-2" />
                Roll Under
              </button>
              <button
                className={`flex-1 py-3 rounded-r-md flex items-center justify-center ${
                  betType === 'over' ? 'bg-accent text-white' : 'bg-neutral text-white hover:bg-opacity-80'
                }`}
                onClick={() => handleBetTypeChange('over')}
                disabled={isBetting}
              >
                <ArrowBigUp className="mr-2" />
                Roll Over
              </button>
            </div>
            
            {/* Target value slider */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>0</span>
                <span>Target Value: {targetValue}</span>
                <span>100</span>
              </div>
              <input
                type="range"
                min="1"
                max="98"
                value={targetValue}
                onChange={(e) => handleTargetChange(Number(e.target.value))}
                disabled={isBetting}
                className="w-full accent-accent"
              />
            </div>
            
            {/* Game stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Win Chance</div>
                <div className="text-xl font-bold">{winChance}%</div>
              </div>
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Multiplier</div>
                <div className="text-xl font-bold">{multiplier}x</div>
              </div>
            </div>
            
            {/* Result display */}
            <div className="bg-primary rounded-lg p-6 flex items-center justify-center relative">
              {result !== null ? (
                <div className={`text-3xl font-bold ${
                  (betType === 'over' && result > targetValue) || 
                  (betType === 'under' && result < targetValue) 
                    ? 'text-win' : 'text-lose'
                }`}>
                  {result}
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-600 flex items-center">
                  <RotateCcw className={`mr-2 ${isBetting ? 'animate-spin-slow' : ''}`} size={24} />
                  Roll
                </div>
              )}
              
              {result !== null && (
                <div className="absolute top-2 right-2">
                  {(betType === 'over' && result > targetValue) || 
                   (betType === 'under' && result < targetValue) ? (
                    <div className="chip bg-win/20 text-win">Win</div>
                  ) : (
                    <div className="chip bg-lose/20 text-lose">Lose</div>
                  )}
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

export default DicePage;