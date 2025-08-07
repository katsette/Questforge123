import React from 'react';

const AbilityScores = ({ character, isOwner, onStatsChange }) => {
  const stats = character.stats || {};

  // D&D 5e standard ability scores
  const abilities = [
    { 
      key: 'strength', 
      name: 'Strength', 
      abbrev: 'STR',
      description: 'Measures physical power. Important for: Athletics, melee attacks, carrying capacity'
    },
    { 
      key: 'dexterity', 
      name: 'Dexterity', 
      abbrev: 'DEX',
      description: 'Measures agility and reflexes. Important for: AC, initiative, ranged attacks, stealth'
    },
    { 
      key: 'constitution', 
      name: 'Constitution', 
      abbrev: 'CON',
      description: 'Measures endurance and health. Important for: Hit points, concentration, poison resistance'
    },
    { 
      key: 'intelligence', 
      name: 'Intelligence', 
      abbrev: 'INT',
      description: 'Measures reasoning and memory. Important for: Investigation, knowledge skills, wizard spells'
    },
    { 
      key: 'wisdom', 
      name: 'Wisdom', 
      abbrev: 'WIS',
      description: 'Measures awareness and insight. Important for: Perception, survival, cleric/druid spells'
    },
    { 
      key: 'charisma', 
      name: 'Charisma', 
      abbrev: 'CHA',
      description: 'Measures force of personality. Important for: Social skills, bard/sorcerer/warlock spells'
    }
  ];

  // Calculate ability modifier (D&D 5e standard: (score - 10) / 2, rounded down)
  const getModifier = (score) => {
    const numScore = parseInt(score) || 10;
    return Math.floor((numScore - 10) / 2);
  };

  // Format modifier with + or - sign
  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const handleAbilityChange = (ability, value) => {
    const numValue = parseInt(value) || 8;
    // Ensure ability scores are within reasonable bounds (3-30 is D&D standard, but we'll allow 1-30)
    const clampedValue = Math.max(1, Math.min(30, numValue));
    
    onStatsChange({
      [ability]: clampedValue
    });
  };

  // Calculate total ability score points used (point buy system reference)
  const calculatePointBuy = () => {
    let totalCost = 0;
    const pointBuyCosts = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };
    
    abilities.forEach(ability => {
      const score = stats[ability.key] || 8;
      if (score >= 8 && score <= 15) {
        totalCost += pointBuyCosts[score] || 0;
      }
    });
    
    return totalCost;
  };

  // Standard array reference
  const standardArray = [15, 14, 13, 12, 10, 8];
  const isUsingStandardArray = () => {
    const scores = abilities.map(ability => stats[ability.key] || 8).sort((a, b) => b - a);
    return JSON.stringify(scores) === JSON.stringify(standardArray);
  };

  // Calculate total modifier bonus
  const getTotalModifier = () => {
    return abilities.reduce((total, ability) => {
      return total + getModifier(stats[ability.key] || 8);
    }, 0);
  };

  return (
    <div className="ability-scores">
      <div className="ability-scores-header">
        <h3>Ability Scores</h3>
        <div className="ability-info">
          <div className="point-buy-info">
            <span className="label">Point Buy Cost:</span>
            <span className={`value ${calculatePointBuy() > 27 ? 'over-limit' : ''}`}>
              {calculatePointBuy()} / 27
            </span>
          </div>
          <div className="standard-array-info">
            <span className="label">Standard Array:</span>
            <span className={`value ${isUsingStandardArray() ? 'using-standard' : ''}`}>
              {isUsingStandardArray() ? '✓ Using' : '✗ Not using'}
            </span>
          </div>
          <div className="total-modifier">
            <span className="label">Total Modifier:</span>
            <span className="value">{formatModifier(getTotalModifier())}</span>
          </div>
        </div>
      </div>

      <div className="abilities-grid">
        {abilities.map((ability) => {
          const score = stats[ability.key] || 8;
          const modifier = getModifier(score);
          
          return (
            <div key={ability.key} className="ability-card">
              <div className="ability-header">
                <h4 className="ability-name">{ability.name}</h4>
                <span className="ability-abbrev">{ability.abbrev}</span>
              </div>
              
              <div className="ability-score-section">
                <div className="score-input-wrapper">
                  <label htmlFor={`${ability.key}-score`} className="sr-only">
                    {ability.name} Score
                  </label>
                  <input
                    id={`${ability.key}-score`}
                    type="number"
                    min="1"
                    max="30"
                    value={score}
                    onChange={(e) => handleAbilityChange(ability.key, e.target.value)}
                    disabled={!isOwner}
                    className="ability-score-input"
                  />
                </div>
                
                <div className="ability-modifier">
                  <span className="modifier-value">{formatModifier(modifier)}</span>
                  <span className="modifier-label">modifier</span>
                </div>
              </div>

              <div className="ability-description">
                <p>{ability.description}</p>
              </div>

              {/* Saving throw modifiers - will be enhanced when we add saving throw proficiencies */}
              <div className="saving-throw">
                <span className="save-label">{ability.abbrev} Save:</span>
                <span className="save-value">{formatModifier(modifier)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick reference section */}
      <div className="ability-reference">
        <div className="reference-section">
          <h4>Ability Score Guidelines</h4>
          <div className="reference-grid">
            <div className="reference-item">
              <strong>1:</strong> Barely functioning (catastrophic)
            </div>
            <div className="reference-item">
              <strong>3:</strong> Severely impaired (major disadvantage)
            </div>
            <div className="reference-item">
              <strong>8:</strong> Below average (slight disadvantage)
            </div>
            <div className="reference-item">
              <strong>10-11:</strong> Average human ability
            </div>
            <div className="reference-item">
              <strong>12-13:</strong> Above average (slight advantage)
            </div>
            <div className="reference-item">
              <strong>14-15:</strong> Significantly above average
            </div>
            <div className="reference-item">
              <strong>16-17:</strong> Exceptional human ability
            </div>
            <div className="reference-item">
              <strong>18:</strong> Peak human ability
            </div>
            <div className="reference-item">
              <strong>20:</strong> Legendary (with magic/training)
            </div>
            <div className="reference-item">
              <strong>25:</strong> Godlike power
            </div>
            <div className="reference-item">
              <strong>30:</strong> Maximum possible
            </div>
          </div>
        </div>

        <div className="reference-section">
          <h4>Character Creation Methods</h4>
          <div className="creation-methods">
            <div className="method">
              <strong>Point Buy:</strong> Start with all 8s, spend 27 points to increase scores.
              Costs: 8→0, 9→1, 10→2, 11→3, 12→4, 13→5, 14→7, 15→9 points.
              Maximum 15 before racial bonuses.
            </div>
            <div className="method">
              <strong>Standard Array:</strong> Use the preset scores 15, 14, 13, 12, 10, 8.
              Assign them to abilities as desired.
            </div>
            <div className="method">
              <strong>Rolling:</strong> Roll 4d6, drop lowest, six times.
              Assign results to abilities as desired.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbilityScores;
