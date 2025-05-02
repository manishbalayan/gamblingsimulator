import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PlinkoPage from './pages/PlinkoPage';
import DicePage from './pages/DicePage';
import MinesPage from './pages/MinesPage';
import LimboPage from './pages/LimboPage';
import FlipPage from './pages/FlipPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="plinko" element={<PlinkoPage />} />
        <Route path="dice" element={<DicePage />} />
        <Route path="mines" element={<MinesPage />} />
        <Route path="limbo" element={<LimboPage />} />
        <Route path="flip" element={<FlipPage />} />
      </Route>
    </Routes>
  );
}

export default App;