import React, { useState } from 'react';

const SpellsFeatures = ({ character, isOwner, onStatsChange }) => {
  const stats = character.stats || {};
  const [newSpell, setNewSpell] = useState({
    name: '',
    level: 0,
    school: '',
    castingTime: '',
    range: '',
    components: '',
    duration: '',
    description: '',
    prepared: false,
    ritual: false
  });
  const [newFeature, setNewFeature] = useState({
    name: '',
    source: '',
    description: '',
    uses: 0,
    maxUses: 0,
    rechargeType: 'none'
  });

  // Calculate ability modifier
  const getModifier = (abilityScore) => {
    const score = parseInt(abilityScore) || 10;
    return Math.floor((score - 10) / 2);
  };

  // Format modifier with + or - sign
  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Get spellcasting ability based on class
  const getSpellcastingAbility = () => {
    const spellcastingAbilities = {
      'Wizard': 'intelligence',
      'Cleric': 'wisdom',
      'Druid': 'wisdom',
      'Ranger': 'wisdom',
      'Paladin': 'charisma',
      'Sorcerer': 'charisma',
      'Bard': 'charisma',
      'Warlock': 'charisma',
      'Artificer': 'intelligence'
    };
    return spellcastingAbilities[character.class] || 'intelligence';
  };

  // Calculate spell save DC
  const getSpellSaveDC = () => {
    const spellcastingAbility = getSpellcastingAbility();
    const abilityModifier = getModifier(stats[spellcastingAbility] || 10);
    const proficiencyBonus = Math.ceil(character.level / 4) + 1;
    return 8 + abilityModifier + proficiencyBonus;
  };

  // Calculate spell attack bonus
  const getSpellAttackBonus = () => {
    const spellcastingAbility = getSpellcastingAbility();
    const abilityModifier = getModifier(stats[spellcastingAbility] || 10);
    const proficiencyBonus = Math.ceil(character.level / 4) + 1;
    return abilityModifier + proficiencyBonus;
  };

  // Get spell slots by class and level (simplified)
  const getSpellSlots = () => {
    const spellSlotProgression = {
      'Wizard': {
        1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
        2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
        3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
        4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
        5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
        6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
        7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
        8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
        9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
        10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
        11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
        12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
        13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
        14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
        15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
        16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
        18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
        19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
        20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
      }
    };

    // Use wizard progression as default for full casters
    const fullCasters = ['Wizard', 'Sorcerer', 'Cleric', 'Druid', 'Bard'];
    const halfCasters = ['Paladin', 'Ranger', 'Artificer'];
    const pactCasters = ['Warlock'];

    if (fullCasters.includes(character.class)) {
      return spellSlotProgression['Wizard'][character.level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else if (halfCasters.includes(character.class)) {
      // Half casters start at level 2 and progress slower
      const effectiveLevel = Math.max(0, Math.floor(character.level / 2));
      return spellSlotProgression['Wizard'][effectiveLevel] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else if (pactCasters.includes(character.class)) {
      // Warlocks have different spell slot progression
      const warlockSlots = {
        1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
        11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 4, 18: 4, 19: 4, 20: 4
      };
      const slotLevel = Math.min(5, Math.ceil(character.level / 2));
      const slots = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      slots[slotLevel - 1] = warlockSlots[character.level] || 0;
      return slots;
    }

    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  };

  // Handle spell slot updates
  const updateSpellSlots = (level, current, max) => {
    const currentSlots = stats.spellSlots || {};
    onStatsChange({
      spellSlots: {
        ...currentSlots,
        [level]: { current: Math.max(0, current), max: Math.max(0, max) }
      }
    });
  };

  // Handle adding new spell
  const addSpell = () => {
    if (!newSpell.name.trim()) return;

    const currentSpells = stats.spells || [];
    const updatedSpells = [...currentSpells, {
      id: Date.now(),
      ...newSpell,
      level: parseInt(newSpell.level) || 0
    }];

    onStatsChange({ spells: updatedSpells });
    setNewSpell({
      name: '',
      level: 0,
      school: '',
      castingTime: '',
      range: '',
      components: '',
      duration: '',
      description: '',
      prepared: false,
      ritual: false
    });
  };

  // Handle removing spell
  const removeSpell = (spellId) => {
    const currentSpells = stats.spells || [];
    const updatedSpells = currentSpells.filter(spell => spell.id !== spellId);
    onStatsChange({ spells: updatedSpells });
  };

  // Toggle spell preparation
  const toggleSpellPrepared = (spellId) => {
    const currentSpells = stats.spells || [];
    const updatedSpells = currentSpells.map(spell =>
      spell.id === spellId ? { ...spell, prepared: !spell.prepared } : spell
    );
    onStatsChange({ spells: updatedSpells });
  };

  // Handle adding new feature
  const addFeature = () => {
    if (!newFeature.name.trim()) return;

    const currentFeatures = stats.features || [];
    const updatedFeatures = [...currentFeatures, {
      id: Date.now(),
      ...newFeature,
      uses: parseInt(newFeature.uses) || 0,
      maxUses: parseInt(newFeature.maxUses) || 0
    }];

    onStatsChange({ features: updatedFeatures });
    setNewFeature({
      name: '',
      source: '',
      description: '',
      uses: 0,
      maxUses: 0,
      rechargeType: 'none'
    });
  };

  // Handle removing feature
  const removeFeature = (featureId) => {
    const currentFeatures = stats.features || [];
    const updatedFeatures = currentFeatures.filter(feature => feature.id !== featureId);
    onStatsChange({ features: updatedFeatures });
  };

  // Update feature uses
  const updateFeatureUses = (featureId, uses) => {
    const currentFeatures = stats.features || [];
    const updatedFeatures = currentFeatures.map(feature =>
      feature.id === featureId ? { ...feature, uses: Math.max(0, parseInt(uses) || 0) } : feature
    );
    onStatsChange({ features: updatedFeatures });
  };

  const spells = stats.spells || [];
  const features = stats.features || [];
  const spellSlots = stats.spellSlots || {};
  const maxSpellSlots = getSpellSlots();
  const spellcastingAbility = getSpellcastingAbility();

  const schools = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
  ];

  const rechargeTypes = [
    { value: 'none', label: 'No Limit' },
    { value: 'shortRest', label: 'Short Rest' },
    { value: 'longRest', label: 'Long Rest' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'turn', label: 'Per Turn' },
    { value: 'round', label: 'Per Round' }
  ];

  return (
    <div className="spells-features">
      <div className="spells-features-header">
        <h3>Spells & Features</h3>
        <div className="spellcasting-info">
          <div className="spellcasting-ability">
            <span>Spellcasting Ability: {spellcastingAbility.charAt(0).toUpperCase() + spellcastingAbility.slice(1)} ({formatModifier(getModifier(stats[spellcastingAbility] || 10))})</span>
          </div>
          <div className="spell-save-dc">
            <span>Spell Save DC: {getSpellSaveDC()}</span>
          </div>
          <div className="spell-attack-bonus">
            <span>Spell Attack: {formatModifier(getSpellAttackBonus())}</span>
          </div>
        </div>
      </div>

      {/* Spell Slots */}
      <div className="spell-slots-section">
        <h4>🌟 Spell Slots</h4>
        <div className="spell-slots-grid">
          {maxSpellSlots.map((maxSlots, index) => {
            if (maxSlots === 0) return null;
            const level = index + 1;
            const currentSlots = spellSlots[level] || { current: maxSlots, max: maxSlots };
            
            return (
              <div key={level} className="spell-slot-level">
                <div className="slot-level-header">
                  <span className="slot-level">Level {level}</span>
                </div>
                <div className="slot-inputs">
                  <input
                    type="number"
                    min="0"
                    max={currentSlots.max}
                    value={currentSlots.current}
                    onChange={(e) => updateSpellSlots(level, parseInt(e.target.value) || 0, currentSlots.max)}
                    disabled={!isOwner}
                    className="current-slots"
                  />
                  <span className="slot-separator">/</span>
                  <input
                    type="number"
                    min="0"
                    value={currentSlots.max}
                    onChange={(e) => updateSpellSlots(level, currentSlots.current, parseInt(e.target.value) || 0)}
                    disabled={!isOwner}
                    className="max-slots"
                    placeholder={maxSlots.toString()}
                  />
                </div>
                <div className="slot-circles">
                  {Array.from({ length: currentSlots.max }, (_, i) => (
                    <div key={i} className={`slot-circle ${i < currentSlots.current ? 'filled' : 'empty'}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cantrips */}
      <div className="cantrips-section">
        <h4>✨ Cantrips</h4>
        <div className="cantrips-list">
          {spells.filter(spell => spell.level === 0).map(spell => (
            <div key={spell.id} className="cantrip-item">
              <div className="spell-header">
                <span className="spell-name">{spell.name}</span>
                <span className="spell-school">({spell.school})</span>
                {isOwner && (
                  <button onClick={() => removeSpell(spell.id)} className="remove-spell-btn">×</button>
                )}
              </div>
              <div className="spell-details">
                <div className="spell-meta">
                  {spell.castingTime && <span>Time: {spell.castingTime}</span>}
                  {spell.range && <span>Range: {spell.range}</span>}
                  {spell.components && <span>Components: {spell.components}</span>}
                  {spell.duration && <span>Duration: {spell.duration}</span>}
                </div>
                {spell.description && <div className="spell-description">{spell.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spells */}
      <div className="spells-section">
        <h4>📜 Spells</h4>
        
        {isOwner && (
          <div className="add-spell-form">
            <div className="spell-form-row">
              <input
                type="text"
                value={newSpell.name}
                onChange={(e) => setNewSpell({ ...newSpell, name: e.target.value })}
                placeholder="Spell name"
                className="spell-name-input"
              />
              <select
                value={newSpell.level}
                onChange={(e) => setNewSpell({ ...newSpell, level: parseInt(e.target.value) })}
                className="spell-level-select"
              >
                <option value={0}>Cantrip</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
              <select
                value={newSpell.school}
                onChange={(e) => setNewSpell({ ...newSpell, school: e.target.value })}
                className="spell-school-select"
              >
                <option value="">School</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
              <label className="prepared-checkbox">
                <input
                  type="checkbox"
                  checked={newSpell.prepared}
                  onChange={(e) => setNewSpell({ ...newSpell, prepared: e.target.checked })}
                />
                Prepared
              </label>
              <label className="ritual-checkbox">
                <input
                  type="checkbox"
                  checked={newSpell.ritual}
                  onChange={(e) => setNewSpell({ ...newSpell, ritual: e.target.checked })}
                />
                Ritual
              </label>
              <button onClick={addSpell} className="add-spell-btn">Add Spell</button>
            </div>
            <div className="spell-form-row">
              <input
                type="text"
                value={newSpell.castingTime}
                onChange={(e) => setNewSpell({ ...newSpell, castingTime: e.target.value })}
                placeholder="Casting time"
                className="spell-meta-input"
              />
              <input
                type="text"
                value={newSpell.range}
                onChange={(e) => setNewSpell({ ...newSpell, range: e.target.value })}
                placeholder="Range"
                className="spell-meta-input"
              />
              <input
                type="text"
                value={newSpell.components}
                onChange={(e) => setNewSpell({ ...newSpell, components: e.target.value })}
                placeholder="Components (V, S, M)"
                className="spell-meta-input"
              />
              <input
                type="text"
                value={newSpell.duration}
                onChange={(e) => setNewSpell({ ...newSpell, duration: e.target.value })}
                placeholder="Duration"
                className="spell-meta-input"
              />
            </div>
            <textarea
              value={newSpell.description}
              onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })}
              placeholder="Spell description..."
              className="spell-description-input"
              rows="3"
            />
          </div>
        )}

        <div className="spells-by-level">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
            const levelSpells = spells.filter(spell => spell.level === level);
            if (levelSpells.length === 0) return null;

            return (
              <div key={level} className="spell-level-group">
                <h5>Level {level} Spells</h5>
                <div className="spells-list">
                  {levelSpells.map(spell => (
                    <div key={spell.id} className="spell-item">
                      <div className="spell-header">
                        <div className="spell-name-section">
                          {isOwner && (
                            <input
                              type="checkbox"
                              checked={spell.prepared}
                              onChange={() => toggleSpellPrepared(spell.id)}
                              className="prepared-checkbox"
                              title="Prepared"
                            />
                          )}
                          <span className="spell-name">{spell.name}</span>
                          <span className="spell-school">({spell.school})</span>
                          {spell.ritual && <span className="ritual-indicator" title="Ritual">R</span>}
                        </div>
                        {isOwner && (
                          <button onClick={() => removeSpell(spell.id)} className="remove-spell-btn">×</button>
                        )}
                      </div>
                      <div className="spell-details">
                        <div className="spell-meta">
                          {spell.castingTime && <span>Time: {spell.castingTime}</span>}
                          {spell.range && <span>Range: {spell.range}</span>}
                          {spell.components && <span>Components: {spell.components}</span>}
                          {spell.duration && <span>Duration: {spell.duration}</span>}
                        </div>
                        {spell.description && <div className="spell-description">{spell.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features & Traits */}
      <div className="features-section">
        <h4>🎭 Features & Traits</h4>
        
        {isOwner && (
          <div className="add-feature-form">
            <div className="feature-form-row">
              <input
                type="text"
                value={newFeature.name}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                placeholder="Feature name"
                className="feature-name-input"
              />
              <input
                type="text"
                value={newFeature.source}
                onChange={(e) => setNewFeature({ ...newFeature, source: e.target.value })}
                placeholder="Source (class, race, feat, etc.)"
                className="feature-source-input"
              />
              <input
                type="number"
                min="0"
                value={newFeature.maxUses}
                onChange={(e) => setNewFeature({ ...newFeature, maxUses: e.target.value, uses: e.target.value })}
                placeholder="Max uses"
                className="feature-uses-input"
              />
              <select
                value={newFeature.rechargeType}
                onChange={(e) => setNewFeature({ ...newFeature, rechargeType: e.target.value })}
                className="feature-recharge-select"
              >
                {rechargeTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <button onClick={addFeature} className="add-feature-btn">Add Feature</button>
            </div>
            <textarea
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              placeholder="Feature description..."
              className="feature-description-input"
              rows="3"
            />
          </div>
        )}

        <div className="features-list">
          {features.map(feature => (
            <div key={feature.id} className="feature-item">
              <div className="feature-header">
                <span className="feature-name">{feature.name}</span>
                {feature.source && <span className="feature-source">({feature.source})</span>}
                {feature.maxUses > 0 && (
                  <div className="feature-uses">
                    {isOwner ? (
                      <input
                        type="number"
                        min="0"
                        max={feature.maxUses}
                        value={feature.uses}
                        onChange={(e) => updateFeatureUses(feature.id, e.target.value)}
                        className="uses-input"
                      />
                    ) : (
                      <span>{feature.uses}</span>
                    )}
                    <span>/ {feature.maxUses}</span>
                    <span className="recharge-type">
                      ({rechargeTypes.find(t => t.value === feature.rechargeType)?.label || 'Unknown'})
                    </span>
                  </div>
                )}
                {isOwner && (
                  <button onClick={() => removeFeature(feature.id)} className="remove-feature-btn">×</button>
                )}
              </div>
              {feature.description && (
                <div className="feature-description">{feature.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpellsFeatures;
