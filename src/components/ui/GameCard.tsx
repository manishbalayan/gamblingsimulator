import React from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, path }) => {
  return (
    <Link to={path} className="game-card block">
      <div className="p-6">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 flex items-center justify-center bg-accent/10 rounded-full mr-3 text-accent">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <div className="bg-accent/10 py-2 px-6 text-xs font-medium text-accent">
        Play Now
      </div>
    </Link>
  );
};

export default GameCard;