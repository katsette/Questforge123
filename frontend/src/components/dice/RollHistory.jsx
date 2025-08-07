import React, { useState } from 'react';

const RollHistory = ({ rolls = [], currentUserId, showPrivateRolls = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'public'

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRollIcon = (roll) => {
    if (roll.isPrivate) return '🔒';
    if (roll.advantage) return '📈';
    if (roll.disadvantage) return '📉';
    return '🎲';
  };

  const getRollClass = (roll) => {
    let classes = ['roll-entry'];
    
    if (roll.userId === currentUserId) classes.push('own-roll');
    if (roll.isPrivate) classes.push('private-roll');
    if (roll.advantage) classes.push('advantage-roll');
    if (roll.disadvantage) classes.push('disadvantage-roll');
    
    // Add result-based classes for visual feedback
    if (roll.individual && roll.individual.length === 1) {
      const die = roll.individual[0];
      const maxValue = roll.formula.includes('d20') ? 20 : 
                     roll.formula.includes('d12') ? 12 :
                     roll.formula.includes('d10') ? 10 :
                     roll.formula.includes('d8') ? 8 :
                     roll.formula.includes('d6') ? 6 :
                     roll.formula.includes('d4') ? 4 : null;
      
      if (maxValue && die === maxValue) classes.push('nat-20');
      if (maxValue && die === 1) classes.push('nat-1');
    }
    
    return classes.join(' ');
  };

  const getFilteredRolls = () => {
    if (!rolls || rolls.length === 0) return [];
    
    let filtered = rolls;
    
    // Filter by privacy/ownership
    switch (filter) {
      case 'mine':
        filtered = rolls.filter(roll => roll.userId === currentUserId);
        break;
      case 'public':
        filtered = rolls.filter(roll => !roll.isPrivate);
        break;
      case 'all':
      default:
        // Show all rolls if showPrivateRolls is true, otherwise filter out private rolls from others
        filtered = showPrivateRolls ? rolls : rolls.filter(roll => 
          !roll.isPrivate || roll.userId === currentUserId
        );
        break;
    }
    
    return filtered;
  };

  const filteredRolls = getFilteredRolls();
  const displayRolls = isExpanded ? filteredRolls : filteredRolls.slice(0, 5);

  if (rolls.length === 0) {
    return (
      <div className="roll-history">
        <h4>Roll History</h4>
        <div className="no-rolls">
          No dice rolls yet. Roll some dice to see your history!
        </div>
      </div>
    );
  }

  return (
    <div className="roll-history">
      <div className="history-header">
        <h4>Roll History ({filteredRolls.length})</h4>
        
        <div className="history-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="history-filter"
          >
            <option value="all">All Rolls</option>
            <option value="mine">My Rolls</option>
            <option value="public">Public Rolls</option>
          </select>
          
          {filteredRolls.length > 5 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-button"
            >
              {isExpanded ? 'Show Less' : `Show All (${filteredRolls.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="roll-list">
        {displayRolls.map((roll, index) => (
          <div key={roll.id || index} className={getRollClass(roll)}>
            <div className="roll-header">
              <div className="roll-meta">
                <span className="roll-icon">{getRollIcon(roll)}</span>
                <span className="roll-user">{roll.username || 'Unknown'}</span>
                <span className="roll-time">{formatTimestamp(roll.timestamp)}</span>
              </div>
              <div className="roll-result">
                <span className="result-value">{roll.result}</span>
              </div>
            </div>
            
            <div className="roll-details">
              <div className="roll-formula">
                <strong>{roll.formula}</strong>
                {roll.reason && (
                  <span className="roll-reason"> - {roll.reason}</span>
                )}
              </div>
              
              {roll.individual && roll.individual.length > 0 && (
                <div className="roll-breakdown">
                  <span className="breakdown-label">Rolls:</span>
                  <span className="individual-rolls">
                    [{roll.individual.join(', ')}]
                  </span>
                  {roll.modifier !== 0 && (
                    <span className="modifier">
                      {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                    </span>
                  )}
                  {(roll.advantage || roll.disadvantage) && (
                    <span className="advantage-indicator">
                      {roll.advantage ? ' (Advantage)' : ' (Disadvantage)'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRolls.length === 0 && filter !== 'all' && (
        <div className="no-filtered-rolls">
          No rolls match the current filter.
        </div>
      )}
    </div>
  );
};

export default RollHistory;
