import React from 'react';
import { CircleDashed, Dice1, Bomb, TrendingUp, Coins } from 'lucide-react';
import GameCard from '../components/ui/GameCard';
import BetHistory from '../components/ui/BetHistory';

const HomePage: React.FC = () => {
  const games = [
    {
      title: 'Plinko',
      description: 'Watch the ball fall and hit big multipliers in this exciting game of chance.',
      icon: <CircleDashed size={24} />,
      path: '/plinko'
    },
    {
      title: 'Dice',
      description: 'Predict whether the roll will be higher or lower than your chosen number.',
      icon: <Dice1 size={24} />,
      path: '/dice'
    },
    {
      title: 'Mines',
      description: 'Avoid the mines and uncover gems to win big with increasing multipliers.',
      icon: <Bomb size={24} />,
      path: '/mines'
    },
    {
      title: 'Limbo',
      description: 'Select a target multiplier and see if you can hit it to win.',
      icon: <TrendingUp size={24} />,
      path: '/limbo'
    },
    {
      title: 'Flip',
      description: 'Classic coin flip game. Pick heads or tails and double your money.',
      icon: <Coins size={24} />,
      path: '/flip'
    }
  ];
  
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Casino Games</h1>
        <p className="text-gray-400">Choose from our selection of provably fair games.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {games.map((game, index) => (
          <GameCard
            key={index}
            title={game.title}
            description={game.description}
            icon={game.icon}
            path={game.path}
          />
        ))}
      </div>
      
      <div className="mt-8">
        <BetHistory />
      </div>
    </div>
  );
};

export default HomePage;