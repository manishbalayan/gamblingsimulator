import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { Minus, Plus } from 'lucide-react';

interface BetControlsProps {
  onPlaceBet: (amount: number) => void;
  disabled?: boolean;
}

const BetControls: React.FC<BetControlsProps> = ({ onPlaceBet, disabled = false }) => {
  const { balance } = useWallet();
  const [betAmount, setBetAmount] = useState<number>(10);
  
  const adjustBet = (adjustment: number) => {
    const newAmount = Math.max(1, Math.min(balance, betAmount + adjustment));
    setBetAmount(newAmount);
  };
  
  const quickBets = [
    { label: 'Min', value: 1 },
    { label: '10', value: 10 },
    { label: '100', value: 100 },
    { label: '1/2', value: balance / 2 },
    { label: 'Max', value: balance },
  ];
  
  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <div className="mb-4">
        <label htmlFor="bet-amount" className="block text-sm font-medium text-gray-400 mb-1">
          Bet Amount
        </label>
        <div className="flex items-center">
          <button
            className="p-2 bg-neutral rounded-l-md hover:bg-opacity-80"
            onClick={() => adjustBet(-1)}
            disabled={betAmount <= 1 || disabled}
          >
            <Minus size={16} />
          </button>
          <input
            id="bet-amount"
            type="number"
            className="input rounded-none text-center w-full"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={1}
            max={balance}
            disabled={disabled}
          />
          <button
            className="p-2 bg-neutral rounded-r-md hover:bg-opacity-80"
            onClick={() => adjustBet(1)}
            disabled={betAmount >= balance || disabled}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {quickBets.map((bet, index) => (
          <button
            key={index}
            className="btn btn-secondary text-xs py-1"
            onClick={() => setBetAmount(Math.floor(bet.value))}
            disabled={disabled}
          >
            {bet.label}
          </button>
        ))}
      </div>
      
      <button
        className="btn btn-primary w-full"
        onClick={() => onPlaceBet(betAmount)}
        disabled={disabled || betAmount > balance || betAmount < 1}
      >
        Place Bet
      </button>
      
      <div className="mt-2 text-center text-sm text-gray-400">
        Balance: {balance.toFixed(2)}
      </div>
    </div>
  );
};

export default BetControls;