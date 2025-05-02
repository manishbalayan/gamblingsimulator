// Generate a random number between min and max (inclusive)
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random float between min and max
export const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate a random result for a given probability
export const getRandomResult = (winProbability: number): boolean => {
  return Math.random() < winProbability;
};

// Format a number to display with a certain number of decimal places
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

// Generate a unique ID for bet records
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Calculate profit based on bet amount and multiplier
export const calculateProfit = (betAmount: number, multiplier: number): number => {
  return betAmount * multiplier - betAmount;
};

// Simulate delay for "fairness" visualization
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};