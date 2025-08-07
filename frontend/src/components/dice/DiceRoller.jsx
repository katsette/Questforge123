import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DicePresets from './DicePresets';
import RollHistory from './RollHistory';
import './DiceRoller.css';

const DiceRoller = ({ campaignId = null, socket = null }) => {
  const { authFetch, user } = useAuth();
  const [formula, setFormula] = useState('1d20');
  const [reason, setReason] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Listen for dice rolls via socket if available
    if (socket) {
      socket.on('diceRoll', (rollData) => {
        setRollHistory(prev => [rollData, ...prev.slice(0, 49)]); // Keep last 50 rolls
      });

      return () => {
        socket.off('diceRoll');
      };
    }
  }, [socket]);

  // Reset advantage/disadvantage when one is selected
  useEffect(() => {
    if (advantage && disadvantage) {
      setDisadvantage(false);
    }
  }, [advantage, disadvantage]);

  useEffect(() => {
    if (disadvantage && advantage) {
      setAdvantage(false);
    }
  }, [disadvantage, advantage]);

  const handleRoll = async (e) => {
    e.preventDefault();
    setIsRolling(true);
    setError('');
    setSuccess('');

    try {
      const response = await authFetch('/api/dice/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formula: formula.trim(),
          reason: reason.trim(),
          isPrivate,
          advantage,
          disadvantage,
          campaignId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Roll failed');
      }

      const rollData = await response.json();
      
      // Add to local history if not coming via socket
      if (!socket) {
        setRollHistory(prev => [rollData, ...prev.slice(0, 49)]);
      }

      setSuccess(`Rolled ${rollData.result}!`);
      
      // Clear reason after successful roll
      setReason('');

    } catch (error) {
      console.error('Roll error:', error);
      setError(error.message || 'Failed to roll dice');
    } finally {
      setIsRolling(false);
    }
  };

  const handlePresetSelect = (preset) => {
    setFormula(preset.notation);
    setAdvantage(false);
    setDisadvantage(false);
  };

  const handleQuickRoll = async (quickFormula) => {
    const originalFormula = formula;
    setFormula(quickFormula);
    
    // Trigger roll with the quick formula
    setIsRolling(true);
    setError('');
    setSuccess('');

    try {
      const response = await authFetch('/api/dice/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formula: quickFormula.trim(),
          reason: reason.trim(),
          isPrivate,
          advantage: false,
          disadvantage: false,
          campaignId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Roll failed');
      }

      const rollData = await response.json();
      
      if (!socket) {
        setRollHistory(prev => [rollData, ...prev.slice(0, 49)]);
      }

      setSuccess(`Quick rolled ${rollData.result}!`);

    } catch (error) {
      console.error('Quick roll error:', error);
      setError(error.message || 'Failed to roll dice');
      setFormula(originalFormula); // Restore original formula on error
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="dice-roller">
      <div className="dice-roller-header">
        <h3>🎲 Dice Roller</h3>
        {campaignId && (
          <small className="campaign-indicator">Campaign Mode</small>
        )}
      </div>

      <form onSubmit={handleRoll} className="dice-form">
        <div className="formula-input-group">
          <label htmlFor="formula">Dice Formula</label>
          <input
            type="text"
            id="formula"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="e.g., 1d20, 2d6+3, 4d4-1"
            required
            disabled={isRolling}
            className="formula-input"
          />
          <small className="formula-help">
            Format: [number]d[sides][+/-modifier] (e.g., 1d20, 2d6+3)
          </small>
        </div>

        <div className="reason-input-group">
          <label htmlFor="reason">Reason (optional)</label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Attack roll, damage, skill check..."
            disabled={isRolling}
            className="reason-input"
          />
        </div>

        <div className="roll-options">
          <div className="advantage-controls">
            <label>
              <input
                type="checkbox"
                checked={advantage}
                onChange={(e) => setAdvantage(e.target.checked)}
                disabled={isRolling || disadvantage}
              />
              Advantage
            </label>
            <label>
              <input
                type="checkbox"
                checked={disadvantage}
                onChange={(e) => setDisadvantage(e.target.checked)}
                disabled={isRolling || advantage}
              />
              Disadvantage
            </label>
          </div>

          {campaignId && (
            <label className="privacy-option">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={isRolling}
              />
              Private Roll (GM only)
            </label>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isRolling || !formula.trim()}
          className="roll-button"
        >
          {isRolling ? 'Rolling...' : '🎲 Roll Dice'}
        </button>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>

      <DicePresets 
        onPresetSelect={handlePresetSelect}
        onQuickRoll={handleQuickRoll}
        disabled={isRolling}
      />

      <RollHistory 
        rolls={rollHistory}
        currentUserId={user?.id}
        showPrivateRolls={true}
      />
    </div>
  );
};

export default DiceRoller;
