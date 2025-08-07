import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DicePresets = ({ onPresetSelect, onQuickRoll, disabled = false }) => {
  const { authFetch } = useAuth();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await authFetch('/api/dice/presets');
      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets || []);
      } else {
        throw new Error('Failed to load presets');
      }
    } catch (error) {
      console.error('Error loading dice presets:', error);
      setError('Failed to load dice presets');
      // Fallback to default presets
      setPresets([
        { name: 'D4', notation: '1d4' },
        { name: 'D6', notation: '1d6' },
        { name: 'D8', notation: '1d8' },
        { name: 'D10', notation: '1d10' },
        { name: 'D12', notation: '1d12' },
        { name: 'D20', notation: '1d20' },
        { name: 'D100', notation: '1d100' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset, isQuickRoll = false) => {
    if (disabled) return;
    
    if (isQuickRoll && onQuickRoll) {
      onQuickRoll(preset.notation);
    } else if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  if (loading) {
    return (
      <div className="dice-presets">
        <h4>Quick Dice</h4>
        <div className="presets-loading">Loading presets...</div>
      </div>
    );
  }

  if (error && presets.length === 0) {
    return (
      <div className="dice-presets">
        <h4>Quick Dice</h4>
        <div className="presets-error">{error}</div>
      </div>
    );
  }

  // Separate common dice from specialized presets
  const basicDice = presets.filter(p => 
    ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'].includes(p.name)
  );
  const specialPresets = presets.filter(p => 
    !['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'].includes(p.name)
  );

  return (
    <div className="dice-presets">
      <h4>Quick Dice</h4>
      
      {/* Basic Dice */}
      <div className="preset-section">
        <h5>Basic Dice</h5>
        <div className="preset-grid basic-dice">
          {basicDice.map((preset, index) => (
            <div key={index} className="preset-item">
              <button
                type="button"
                className="preset-button"
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                title={`Set formula to ${preset.notation}`}
              >
                {preset.name}
              </button>
              <button
                type="button"
                className="quick-roll-button"
                onClick={() => handlePresetClick(preset, true)}
                disabled={disabled}
                title={`Quick roll ${preset.notation}`}
              >
                ⚡
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Special Presets */}
      {specialPresets.length > 0 && (
        <div className="preset-section">
          <h5>Common Rolls</h5>
          <div className="preset-grid special-presets">
            {specialPresets.map((preset, index) => (
              <div key={index} className="preset-item special">
                <button
                  type="button"
                  className="preset-button"
                  onClick={() => handlePresetClick(preset)}
                  disabled={disabled}
                  title={`Set formula to ${preset.notation}`}
                >
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-notation">{preset.notation}</div>
                </button>
                <button
                  type="button"
                  className="quick-roll-button"
                  onClick={() => handlePresetClick(preset, true)}
                  disabled={disabled}
                  title={`Quick roll ${preset.notation}`}
                >
                  ⚡
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="preset-help">
        <small>
          Click a die to set the formula, or click ⚡ to roll immediately
        </small>
      </div>
    </div>
  );
};

export default DicePresets;
