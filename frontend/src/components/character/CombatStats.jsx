import React from 'react';

const CombatStats = ({ character, isOwner, onStatsChange }) => {
  const stats = character.stats || {};

  // Calculate ability modifier
  const getModifier = (abilityScore) => {
    const score = parseInt(abilityScore) || 10;
    return Math.floor((score - 10) / 2);
  };

  // Format modifier with + or - sign
  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Calculate proficiency bonus based on character level
  const getProficiencyBonus = () => {
    return Math.ceil(character.level / 4) + 1;
  };

  // Calculate Hit Die based on class (D&D 5e standard)
  const getHitDie = () => {
    const hitDieByClass = {
      'Barbarian': 'd12',
      'Fighter': 'd10',
      'Paladin': 'd10',
      'Ranger': 'd10',
      'Bard': 'd8',
      'Cleric': 'd8',
      'Druid': 'd8',
      'Monk': 'd8',
      'Rogue': 'd8',
      'Warlock': 'd8',
      'Sorcerer': 'd6',
      'Wizard': 'd6',
      'Artificer': 'd8'
    };
    return hitDieByClass[character.class] || 'd8';
  };

  // Calculate suggested max hit points (average)
  const getSuggestedMaxHP = () => {
    const hitDieAverages = {
      'd6': 4, 'd8': 5, 'd10': 6, 'd12': 7
    };
    const hitDie = getHitDie();
    const baseHP = hitDieAverages[hitDie] || 5;
    const conModifier = getModifier(stats.constitution || 10);
    
    // First level is max + con modifier, subsequent levels are average + con modifier
    const firstLevelHP = parseInt(hitDie.substring(1)) + conModifier;
    const subsequentLevelsHP = (character.level - 1) * (baseHP + conModifier);
    
    return Math.max(1, firstLevelHP + subsequentLevelsHP);
  };

  // Calculate Armor Class
  const calculateAC = () => {
    const baseAC = stats.armorClass || 10;
    const dexModifier = getModifier(stats.dexterity || 10);
    
    // If no custom AC is set, calculate based on armor type or default
    if (!stats.armorClass) {
      // Default unarmored AC (10 + Dex modifier)
      return 10 + dexModifier;
    }
    
    return baseAC;
  };

  // Calculate Initiative
  const getInitiative = () => {
    const dexModifier = getModifier(stats.dexterity || 10);
    const initiativeBonus = stats.initiativeBonus || 0;
    return dexModifier + initiativeBonus;
  };

  // Calculate Speed
  const getSpeed = () => {
    // Base speed by race (simplified - in a full implementation you'd have racial bonuses)
    const baseSpeed = stats.speed || 30;
    return baseSpeed;
  };

  // Death Save tracking
  const getDeathSaves = () => {
    return {
      successes: stats.deathSaves?.successes || 0,
      failures: stats.deathSaves?.failures || 0
    };
  };

  const updateDeathSaves = (type, value) => {
    const currentDeathSaves = stats.deathSaves || { successes: 0, failures: 0 };
    const newDeathSaves = {
      ...currentDeathSaves,
      [type]: Math.max(0, Math.min(3, value))
    };
    onStatsChange({ deathSaves: newDeathSaves });
  };

  // Handle stat updates
  const updateCombatStat = (field, value) => {
    onStatsChange({ [field]: value });
  };

  return (
    <div className="combat-stats">
      <div className="combat-header">
        <h3>Combat Statistics</h3>
        <div className="combat-summary">
          <span className="level-info">Level {character.level} {character.class}</span>
          <span className="hit-die-info">Hit Die: {getHitDie()}</span>
          <span className="prof-bonus-info">Proficiency: +{getProficiencyBonus()}</span>
        </div>
      </div>

      <div className="combat-grid">
        {/* Armor Class */}
        <div className="combat-stat-card ac-card">
          <div className="stat-header">
            <h4>Armor Class</h4>
            <div className="stat-value large-value">{calculateAC()}</div>
          </div>
          <div className="stat-details">
            <div className="detail-row">
              <label htmlFor="base-ac">Base AC:</label>
              <input
                id="base-ac"
                type="number"
                min="10"
                max="30"
                value={stats.armorClass || ''}
                onChange={(e) => updateCombatStat('armorClass', parseInt(e.target.value) || '')}
                disabled={!isOwner}
                className="stat-input"
                placeholder="10"
              />
            </div>
            <div className="detail-row">
              <span>Dex Modifier: {formatModifier(getModifier(stats.dexterity || 10))}</span>
            </div>
            <textarea
              value={stats.armorDescription || ''}
              onChange={(e) => updateCombatStat('armorDescription', e.target.value)}
              disabled={!isOwner}
              className="armor-description"
              placeholder="Describe armor, shields, magical bonuses..."
              rows="2"
            />
          </div>
        </div>

        {/* Hit Points */}
        <div className="combat-stat-card hp-card">
          <div className="stat-header">
            <h4>Hit Points</h4>
            <div className="hp-display">
              <input
                type="number"
                min="0"
                value={stats.currentHP || 0}
                onChange={(e) => updateCombatStat('currentHP', parseInt(e.target.value) || 0)}
                disabled={!isOwner}
                className="current-hp"
              />
              <span className="hp-separator">/</span>
              <input
                type="number"
                min="1"
                value={stats.maxHP || getSuggestedMaxHP()}
                onChange={(e) => updateCombatStat('maxHP', parseInt(e.target.value) || 1)}
                disabled={!isOwner}
                className="max-hp"
              />
            </div>
          </div>
          <div className="stat-details">
            <div className="detail-row">
              <span>Suggested Max: {getSuggestedMaxHP()}</span>
              <span>Con Modifier: {formatModifier(getModifier(stats.constitution || 10))}</span>
            </div>
            <div className="temp-hp-row">
              <label htmlFor="temp-hp">Temporary HP:</label>
              <input
                id="temp-hp"
                type="number"
                min="0"
                value={stats.temporaryHP || 0}
                onChange={(e) => updateCombatStat('temporaryHP', parseInt(e.target.value) || 0)}
                disabled={!isOwner}
                className="temp-hp-input"
              />
            </div>
          </div>
        </div>

        {/* Initiative */}
        <div className="combat-stat-card initiative-card">
          <div className="stat-header">
            <h4>Initiative</h4>
            <div className="stat-value">{formatModifier(getInitiative())}</div>
          </div>
          <div className="stat-details">
            <div className="detail-row">
              <span>Dex Modifier: {formatModifier(getModifier(stats.dexterity || 10))}</span>
            </div>
            <div className="detail-row">
              <label htmlFor="initiative-bonus">Bonus:</label>
              <input
                id="initiative-bonus"
                type="number"
                value={stats.initiativeBonus || 0}
                onChange={(e) => updateCombatStat('initiativeBonus', parseInt(e.target.value) || 0)}
                disabled={!isOwner}
                className="stat-input"
              />
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="combat-stat-card speed-card">
          <div className="stat-header">
            <h4>Speed</h4>
            <div className="stat-value">{getSpeed()} ft</div>
          </div>
          <div className="stat-details">
            <div className="detail-row">
              <label htmlFor="walking-speed">Walking:</label>
              <input
                id="walking-speed"
                type="number"
                min="0"
                value={stats.speed || 30}
                onChange={(e) => updateCombatStat('speed', parseInt(e.target.value) || 30)}
                disabled={!isOwner}
                className="stat-input"
              />
              <span>ft</span>
            </div>
            <div className="other-speeds">
              <div className="speed-row">
                <label htmlFor="fly-speed">Flying:</label>
                <input
                  id="fly-speed"
                  type="number"
                  min="0"
                  value={stats.flySpeed || 0}
                  onChange={(e) => updateCombatStat('flySpeed', parseInt(e.target.value) || 0)}
                  disabled={!isOwner}
                  className="speed-input"
                />
                <span>ft</span>
              </div>
              <div className="speed-row">
                <label htmlFor="swim-speed">Swimming:</label>
                <input
                  id="swim-speed"
                  type="number"
                  min="0"
                  value={stats.swimSpeed || 0}
                  onChange={(e) => updateCombatStat('swimSpeed', parseInt(e.target.value) || 0)}
                  disabled={!isOwner}
                  className="speed-input"
                />
                <span>ft</span>
              </div>
              <div className="speed-row">
                <label htmlFor="climb-speed">Climbing:</label>
                <input
                  id="climb-speed"
                  type="number"
                  min="0"
                  value={stats.climbSpeed || 0}
                  onChange={(e) => updateCombatStat('climbSpeed', parseInt(e.target.value) || 0)}
                  disabled={!isOwner}
                  className="speed-input"
                />
                <span>ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hit Dice */}
      <div className="hit-dice-section">
        <h4>Hit Dice</h4>
        <div className="hit-dice-tracker">
          <div className="hit-dice-info">
            <span className="hit-dice-total">Total: {character.level}{getHitDie()}</span>
            <div className="hit-dice-current">
              <label htmlFor="current-hit-dice">Remaining:</label>
              <input
                id="current-hit-dice"
                type="number"
                min="0"
                max={character.level}
                value={stats.currentHitDice ?? character.level}
                onChange={(e) => updateCombatStat('currentHitDice', parseInt(e.target.value) || 0)}
                disabled={!isOwner}
                className="hit-dice-input"
              />
              <span>/ {character.level}</span>
            </div>
          </div>
          <p className="hit-dice-help">
            Hit dice recover on a long rest. Spend during short rests to regain HP.
          </p>
        </div>
      </div>

      {/* Death Saves */}
      <div className="death-saves-section">
        <h4>Death Saving Throws</h4>
        <div className="death-saves-tracker">
          <div className="death-save-category">
            <label>Successes:</label>
            <div className="death-save-boxes">
              {[1, 2, 3].map(i => (
                <label key={`success-${i}`} className="death-save-checkbox">
                  <input
                    type="checkbox"
                    checked={getDeathSaves().successes >= i}
                    onChange={(e) => {
                      const newValue = e.target.checked ? i : Math.max(0, i - 1);
                      updateDeathSaves('successes', newValue);
                    }}
                    disabled={!isOwner}
                  />
                  <span className="checkmark success"></span>
                </label>
              ))}
            </div>
          </div>
          <div className="death-save-category">
            <label>Failures:</label>
            <div className="death-save-boxes">
              {[1, 2, 3].map(i => (
                <label key={`failure-${i}`} className="death-save-checkbox">
                  <input
                    type="checkbox"
                    checked={getDeathSaves().failures >= i}
                    onChange={(e) => {
                      const newValue = e.target.checked ? i : Math.max(0, i - 1);
                      updateDeathSaves('failures', newValue);
                    }}
                    disabled={!isOwner}
                  />
                  <span className="checkmark failure"></span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <p className="death-saves-help">
          When at 0 HP, roll d20 on your turn. 10+ is success, &lt;10 is failure. 
          3 successes = stabilized, 3 failures = death. Natural 20 = regain 1 HP, natural 1 = 2 failures.
        </p>
      </div>

      {/* Resistances and Immunities */}
      <div className="resistances-section">
        <h4>Resistances & Vulnerabilities</h4>
        
        <div className="resistance-category">
          <label htmlFor="damage-resistances">Damage Resistances:</label>
          <textarea
            id="damage-resistances"
            value={stats.damageResistances || ''}
            onChange={(e) => updateCombatStat('damageResistances', e.target.value)}
            disabled={!isOwner}
            className="resistance-textarea"
            placeholder="Fire, cold, bludgeoning from nonmagical attacks..."
            rows="2"
          />
        </div>

        <div className="resistance-category">
          <label htmlFor="damage-immunities">Damage Immunities:</label>
          <textarea
            id="damage-immunities"
            value={stats.damageImmunities || ''}
            onChange={(e) => updateCombatStat('damageImmunities', e.target.value)}
            disabled={!isOwner}
            className="resistance-textarea"
            placeholder="Poison, psychic..."
            rows="2"
          />
        </div>

        <div className="resistance-category">
          <label htmlFor="damage-vulnerabilities">Damage Vulnerabilities:</label>
          <textarea
            id="damage-vulnerabilities"
            value={stats.damageVulnerabilities || ''}
            onChange={(e) => updateCombatStat('damageVulnerabilities', e.target.value)}
            disabled={!isOwner}
            className="resistance-textarea"
            placeholder="Fire, radiant..."
            rows="2"
          />
        </div>

        <div className="resistance-category">
          <label htmlFor="condition-immunities">Condition Immunities:</label>
          <textarea
            id="condition-immunities"
            value={stats.conditionImmunities || ''}
            onChange={(e) => updateCombatStat('conditionImmunities', e.target.value)}
            disabled={!isOwner}
            className="resistance-textarea"
            placeholder="Charmed, frightened, poisoned..."
            rows="2"
          />
        </div>
      </div>
    </div>
  );
};

export default CombatStats;
