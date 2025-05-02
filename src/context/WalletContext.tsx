import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  balance: number;
  addBalance: (amount: number) => void;
  subtractBalance: (amount: number) => boolean;
  bettingHistory: BetRecord[];
  addBetRecord: (record: BetRecord) => void;
}

export interface BetRecord {
  id: string;
  game: string;
  amount: number;
  outcome: 'win' | 'lose';
  profit: number;
  timestamp: Date;
  details?: string;
}

const defaultContext: WalletContextType = {
  balance: 1000, // Starting balance
  addBalance: () => {},
  subtractBalance: () => false,
  bettingHistory: [],
  addBetRecord: () => {},
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('wallet_balance');
    return savedBalance ? parseFloat(savedBalance) : 1000;
  });
  
  const [bettingHistory, setBettingHistory] = useState<BetRecord[]>(() => {
    const savedHistory = localStorage.getItem('betting_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem('wallet_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('betting_history', JSON.stringify(bettingHistory));
  }, [bettingHistory]);

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const subtractBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  const addBetRecord = (record: BetRecord) => {
    setBettingHistory(prev => [record, ...prev].slice(0, 50)); // Keep only last 50 records
  };

  return (
    <WalletContext.Provider value={{ 
      balance, 
      addBalance, 
      subtractBalance, 
      bettingHistory, 
      addBetRecord 
    }}>
      {children}
    </WalletContext.Provider>
  );
};