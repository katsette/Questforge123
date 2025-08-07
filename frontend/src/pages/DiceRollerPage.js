import React from 'react';
import { DiceRoller } from '../components/dice';
import { socketService } from '../services/socketService';

const DiceRollerPage = () => {
  return (
    <div className="dice-roller-page">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎲 Dice Roller</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Roll dice for your tabletop adventures! Supports standard notation like 1d20, 2d6+3, etc.
        </p>
      </div>
      
      <div className="page-content">
        <DiceRoller socket={socketService.getSocket()} />
      </div>
    </div>
  );
};

export default DiceRollerPage;
