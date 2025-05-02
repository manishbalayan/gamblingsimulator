import React, { useState, useEffect } from 'react';
import BetControls from '../components/ui/BetControls';
import BetHistory from '../components/ui/BetHistory';
import { useWallet } from '../context/WalletContext';
import { getRandomNumber, generateId } from '../utils/gameUtils';
import { Gem, Bomb, Award, Cast as Cash } from 'lucide-react';

interface Cell {
  revealed: boolean;
  isMine: boolean;
}

const MinesPage: React.FC = () => {
  const { subtractBalance, addBalance, addBetRecord } = useWallet();
  const [gameActive, setGameActive] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [potentialWinnings, setPotentialWinnings] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  
  const gridSize = 5;
  const totalCells = gridSize * gridSize;
  
  // Initialize grid
  const initializeGrid = () => {
    // Create empty grid
    const newGrid: Cell[][] = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => ({
        revealed: false,
        isMine: false,
      }))
    );
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = getRandomNumber(0, gridSize - 1);
      const col = getRandomNumber(0, gridSize - 1);
      
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }
    
    setGrid(newGrid);
  };
  
  // Reset the game
  const resetGame = () => {
    setGameActive(false);
    setResult(null);
    setCurrentMultiplier(1);
    setPotentialWinnings(0);
    setBetAmount(0);
    initializeGrid();
  };
  
  // Handle placing a bet
  const handlePlaceBet = (amount: number) => {
    if (subtractBalance(amount)) {
      setBetAmount(amount);
      setGameActive(true);
      setCurrentMultiplier(1);
      setPotentialWinnings(amount);
      initializeGrid();
    }
  };
  
  // Handle revealing a cell
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!gameActive || grid[rowIndex][colIndex].revealed) return;
    
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex].revealed = true;
    setGrid(newGrid);
    
    if (newGrid[rowIndex][colIndex].isMine) {
      // Hit a mine - game over
      setGameActive(false);
      setResult('lose');
      
      // Reveal all mines
      const finalGrid = newGrid.map(row => 
        row.map(cell => ({
          ...cell,
          revealed: cell.isMine ? true : cell.revealed
        }))
      );
      setGrid(finalGrid);
      
      // Record loss
      addBetRecord({
        id: generateId(),
        game: 'mines',
        amount: betAmount,
        outcome: 'lose',
        profit: -betAmount,
        timestamp: new Date(),
        details: `${mineCount} mines, ${getRevealedCount(newGrid)} cells revealed`
      });
    } else {
      // Calculate new multiplier based on revealed cells
      const revealedCount = getRevealedCount(newGrid);
      const safeCells = totalCells - mineCount;
      
      // More complex multiplier calculation for Mines game
      // The formula increases the multiplier more dramatically as more cells are revealed
      const baseMultiplier = (totalCells / (totalCells - mineCount));
      const newMultiplier = Math.pow(baseMultiplier, revealedCount) * 0.97; // 3% house edge
      
      setCurrentMultiplier(Number(newMultiplier.toFixed(2)));
      setPotentialWinnings(Number((betAmount * newMultiplier).toFixed(2)));
      
      // Check if all safe cells are revealed - player wins
      if (revealedCount === safeCells) {
        cashOut();
      }
    }
  };
  
  // Count revealed cells
  const getRevealedCount = (grid: Cell[][]) => {
    return grid.flat().filter(cell => cell.revealed).length;
  };
  
  // Cash out current winnings
  const cashOut = () => {
    if (!gameActive) return;
    
    setGameActive(false);
    setResult('win');
    addBalance(potentialWinnings);
    
    // Record win
    addBetRecord({
      id: generateId(),
      game: 'mines',
      amount: betAmount,
      outcome: 'win',
      profit: potentialWinnings - betAmount,
      timestamp: new Date(),
      details: `${mineCount} mines, ${getRevealedCount(grid)} cells revealed, ${currentMultiplier}x multiplier`
    });
  };
  
  // Initialize grid on component mount
  useEffect(() => {
    initializeGrid();
  }, [mineCount]);
  
  // Adjust mine count
  const handleMineCountChange = (count: number) => {
    if (!gameActive && count >= 1 && count <= 20) {
      setMineCount(count);
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mines</h1>
        <p className="text-gray-400">Uncover gems and avoid mines to increase your multiplier.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-md p-6">
            {/* Game controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="bg-primary rounded-lg px-3 py-2 flex items-center">
                  <Bomb className="text-red-500 h-5 w-5 mr-2" />
                  <span>Mines:</span>
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-neutral rounded-md"
                  onClick={() => handleMineCountChange(mineCount - 1)}
                  disabled={gameActive || mineCount <= 1}
                >
                  -
                </button>
                <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-md">
                  {mineCount}
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-neutral rounded-md"
                  onClick={() => handleMineCountChange(mineCount + 1)}
                  disabled={gameActive || mineCount >= 20}
                >
                  +
                </button>
              </div>
              
              <button
                className="btn btn-primary flex items-center"
                onClick={cashOut}
                disabled={!gameActive}
              >
                <Cash className="h-4 w-4 mr-1" />
                Cash Out {potentialWinnings.toFixed(2)}
              </button>
            </div>
            
            {/* Game stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Current Multiplier</div>
                <div className="text-xl font-bold">{currentMultiplier}x</div>
              </div>
              <div className="bg-primary rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Potential Win</div>
                <div className="text-xl font-bold">{potentialWinnings.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Game grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {grid.map((row, rowIndex) => 
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square rounded-md flex items-center justify-center transition-all ${
                      cell.revealed
                        ? cell.isMine
                          ? 'bg-lose/20 text-lose'
                          : 'bg-win/20 text-win'
                        : 'bg-primary hover:bg-primary/80'
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={!gameActive || cell.revealed}
                  >
                    {cell.revealed ? (
                      cell.isMine ? (
                        <Bomb className="h-6 w-6" />
                      ) : (
                        <Gem className="h-6 w-6" />
                      )
                    ) : (
                      <span className="h-6 w-6"></span>
                    )}
                  </button>
                ))
              )}
            </div>
            
            {/* Game result */}
            {result && (
              <div className={`p-3 rounded-md text-center font-bold ${
                result === 'win' ? 'bg-win/20 text-win' : 'bg-lose/20 text-lose'
              }`}>
                {result === 'win' ? (
                  <div className="flex items-center justify-center">
                    <Award className="mr-2" />
                    <span>You won {potentialWinnings.toFixed(2)}!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Bomb className="mr-2" />
                    <span>Boom! You hit a mine.</span>
                  </div>
                )}
              </div>
            )}
            
            {!gameActive && !result && (
              <div className="p-3 bg-primary/50 rounded-md text-center text-gray-400">
                Place a bet to start the game
              </div>
            )}
            
            {/* Reset button */}
            {(result || gameActive) && (
              <button
                className="mt-4 btn btn-secondary w-full"
                onClick={resetGame}
              >
                New Game
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <BetControls onPlaceBet={handlePlaceBet} disabled={gameActive} />
          <BetHistory />
        </div>
      </div>
    </div>
  );
};

export default MinesPage;