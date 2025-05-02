import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  CircleDashed, 
  Dice1, 
  Bomb, 
  TrendingUp, 
  Coins,
  Home,
  Clock,
  Settings
} from 'lucide-react';

const games = [
  { name: 'Home', path: '/', icon: <Home size={18} /> },
  { name: 'Plinko', path: '/plinko', icon: <CircleDashed size={18} /> },
  { name: 'Dice', path: '/dice', icon: <Dice1 size={18} /> },
  { name: 'Mines', path: '/mines', icon: <Bomb size={18} /> },
  { name: 'Limbo', path: '/limbo', icon: <TrendingUp size={18} /> },
  { name: 'Flip', path: '/flip', icon: <Coins size={18} /> },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:block w-56 bg-secondary border-r border-neutral overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-4">Casino Games</h2>
        
        <nav className="space-y-1">
          {games.map((game) => (
            <NavLink
              key={game.path}
              to={game.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {game.icon}
              <span>{game.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-8">
          <h3 className="font-semibold text-gray-400 uppercase text-xs mb-2">Account</h3>
          <div className="space-y-1">
            <NavLink to="/history" className="sidebar-link">
              <Clock size={18} />
              <span>History</span>
            </NavLink>
            <NavLink to="/settings" className="sidebar-link">
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;