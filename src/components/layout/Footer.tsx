import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-gray-400 py-3 border-t border-neutral text-sm">
      <div className="container mx-auto px-4 md:flex md:justify-between md:items-center">
        <div className="text-center md:text-left mb-2 md:mb-0">
          <p>&copy; {new Date().getFullYear()} CryptoStake. All rights reserved.</p>
        </div>
        <div className="text-center md:text-right">
          <p>This is a demo application. No real money is used.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;