import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, DollarSign, User } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

const Header: React.FC = () => {
  const { balance } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-secondary shadow-md z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <DollarSign className="h-6 w-6 text-accent mr-2" />
            <span className="text-xl font-bold text-white">CryptoStake</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center px-3 py-1.5 bg-primary rounded-md border border-neutral">
              <DollarSign className="h-4 w-4 text-accent mr-1" />
              <span className="font-medium">{balance.toFixed(2)}</span>
            </div>
            <button className="btn btn-outlined flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>Sign Up</span>
            </button>
            <button className="btn btn-primary flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>Login</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-2">
            <div className="flex items-center px-3 py-2 bg-primary rounded-md">
              <DollarSign className="h-4 w-4 text-accent mr-1" />
              <span className="font-medium">{balance.toFixed(2)}</span>
            </div>
            <button className="w-full btn btn-outlined flex items-center justify-center">
              <User className="h-4 w-4 mr-1" />
              <span>Sign Up</span>
            </button>
            <button className="w-full btn btn-primary flex items-center justify-center">
              <User className="h-4 w-4 mr-1" />
              <span>Login</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;