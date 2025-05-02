import React from 'react';
import { useWallet, BetRecord } from '../../context/WalletContext';

const BetHistory: React.FC = () => {
  const { bettingHistory } = useWallet();
  
  if (bettingHistory.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 shadow-md">
        <h2 className="font-semibold mb-2">Recent Bets</h2>
        <p className="text-gray-400 text-sm">No betting history yet.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <h2 className="font-semibold mb-2">Recent Bets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-neutral">
              <th className="pb-2">Game</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Outcome</th>
              <th className="pb-2">Profit</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {bettingHistory.slice(0, 10).map((bet: BetRecord) => (
              <tr key={bet.id} className="border-b border-neutral/50 hover:bg-secondary/50">
                <td className="py-2 capitalize">{bet.game}</td>
                <td className="py-2">{bet.amount.toFixed(2)}</td>
                <td className="py-2">
                  <span className={`chip ${bet.outcome === 'win' ? 'bg-win/20 text-win' : 'bg-lose/20 text-lose'}`}>
                    {bet.outcome === 'win' ? 'Win' : 'Lose'}
                  </span>
                </td>
                <td className={`py-2 ${bet.outcome === 'win' ? 'text-win' : 'text-lose'}`}>
                  {bet.outcome === 'win' ? '+' : ''}{bet.profit.toFixed(2)}
                </td>
                <td className="py-2 text-gray-400">
                  {new Date(bet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BetHistory;