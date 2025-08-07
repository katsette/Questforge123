import React from 'react';

const SkillsProficiencies = ({ character, isOwner, onStatsChange }) => {
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

  // Calculate proficiency bonus based on character level (D&D 5e standard)
  const getProficiencyBonus = () => {
    return Math.ceil(character.level / 4) + 1;
  };

  // D&D 5e standard skills with their governing abilities
  const skills = [
    { key: 'acrobatics', name: 'Acrobatics', ability: 'dexterity', abbrev: 'Dex' },
    { key: 'animalHandling', name: 'Animal Handling', ability: 'wisdom', abbrev: 'Wis' },
    { key: 'arcana', name: 'Arcana', ability: 'intelligence', abbrev: 'Int' },
    { key: 'athletics', name: 'Athletics', ability: 'strength', abbrev: 'Str' },
    { key: 'deception', name: 'Deception', ability: 'charisma', abbrev: 'Cha' },
    { key: 'history', name: 'History', ability: 'intelligence', abbrev: 'Int' },
    { key: 'insight', name: 'Insight', ability: 'wisdom', abbrev: 'Wis' },
    { key: 'intimidation', name: 'Intimidation', ability: 'charisma', abbrev: 'Cha' },
    { key: 'investigation', name: 'Investigation', ability: 'intelligence', abbrev: 'Int' },
    { key: 'medicine', name: 'Medicine', ability: 'wisdom', abbrev: 'Wis' },
    { key: 'nature', name: 'Nature', ability: 'intelligence', abbrev: 'Int' },
    { key: 'perception', name: 'Perception', ability: 'wisdom', abbrev: 'Wis' },
    { key: 'performance', name: 'Performance', ability: 'charisma', abbrev: 'Cha' },
    { key: 'persuasion', name: 'Persuasion', ability: 'charisma', abbrev: 'Cha' },
    { key: 'religion', name: 'Religion', ability: 'intelligence', abbrev: 'Int' },
    { key: 'sleightOfHand', name: 'Sleight of Hand', ability: 'dexterity', abbrev: 'Dex' },
    { key: 'stealth', name: 'Stealth', ability: 'dexterity', abbrev: 'Dex' },
    { key: 'survival', name: 'Survival', ability: 'wisdom', abbrev: 'Wis' }
  ];

  // D&D 5e saving throws
  const savingThrows = [
    { key: 'strength', name: 'Strength', abbrev: 'Str' },
    { key: 'dexterity', name: 'Dexterity', abbrev: 'Dex' },
    { key: 'constitution', name: 'Constitution', abbrev: 'Con' },
    { key: 'intelligence', name: 'Intelligence', abbrev: 'Int' },
    { key: 'wisdom', name: 'Wisdom', abbrev: 'Wis' },
    { key: 'charisma', name: 'Charisma', abbrev: 'Cha' }
  ];

  // Calculate skill bonus
  const getSkillBonus = (skill) => {
    const abilityScore = stats[skill.ability] || 10;
    const abilityModifier = getModifier(abilityScore);
    const proficiencyBonus = getProficiencyBonus();
    
    const proficient = stats.skillProficiencies?.[skill.key] || false;
    const expertise = stats.skillExpertise?.[skill.key] || false;
    
    let bonus = abilityModifier;
    if (proficient) {
      bonus += proficiencyBonus;
    }
    if (expertise) {
      bonus += proficiencyBonus; // Expertise doubles proficiency bonus
    }
    
    return bonus;
  };

  // Calculate saving throw bonus
  const getSaveBonus = (save) => {
    const abilityScore = stats[save.key] || 10;
    const abilityModifier = getModifier(abilityScore);
    const proficiencyBonus = getProficiencyBonus();
    
    const proficient = stats.saveProficiencies?.[save.key] || false;
    
    let bonus = abilityModifier;
    if (proficient) {
      bonus += proficiencyBonus;
    }
    
    return bonus;
  };

  // Handle skill proficiency toggle
  const toggleSkillProficiency = (skillKey) => {
    const currentProficiencies = stats.skillProficiencies || {};
    const newProficiencies = {
      ...currentProficiencies,
      [skillKey]: !currentProficiencies[skillKey]
    };
    
    onStatsChange({
      skillProficiencies: newProficiencies
    });
  };

  // Handle skill expertise toggle
  const toggleSkillExpertise = (skillKey) => {
    const currentExpertise = stats.skillExpertise || {};
    const newExpertise = {
      ...currentExpertise,
      [skillKey]: !currentExpertise[skillKey]
    };
    
    onStatsChange({
      skillExpertise: newExpertise
    });
  };

  // Handle saving throw proficiency toggle
  const toggleSaveProficiency = (saveKey) => {
    const currentProficiencies = stats.saveProficiencies || {};
    const newProficiencies = {
      ...currentProficiencies,
      [saveKey]: !currentProficiencies[saveKey]
    };
    
    onStatsChange({
      saveProficiencies: newProficiencies
    });
  };

  // Count proficiencies for reference
  const countSkillProficiencies = () => {
    const proficiencies = stats.skillProficiencies || {};
    return Object.values(proficiencies).filter(Boolean).length;
  };

  const countSkillExpertise = () => {
    const expertise = stats.skillExpertise || {};
    return Object.values(expertise).filter(Boolean).length;
  };

  return (
    <div className="skills-proficiencies">
      <div className="section-header">
        <h3>Skills & Proficiencies</h3>
        <div className="proficiency-info">
          <span className="prof-bonus">Proficiency Bonus: +{getProficiencyBonus()}</span>
          <span className="skill-count">Skills: {countSkillProficiencies()} proficient, {countSkillExpertise()} expertise</span>
        </div>
      </div>

      <div className="skills-saves-container">
        {/* Skills Section */}
        <div className="skills-section">
          <h4>Skills</h4>
          <div className="skills-list">
            {skills.map((skill) => {
              const bonus = getSkillBonus(skill);
              const proficient = stats.skillProficiencies?.[skill.key] || false;
              const expertise = stats.skillExpertise?.[skill.key] || false;
              
              return (
                <div key={skill.key} className="skill-row">
                  <div className="skill-proficiency">
                    <label className="proficiency-checkbox">
                      <input
                        type="checkbox"
                        checked={proficient}
                        onChange={() => toggleSkillProficiency(skill.key)}
                        disabled={!isOwner}
                      />
                      <span className="checkmark proficient"></span>
                    </label>
                    
                    <label className="expertise-checkbox">
                      <input
                        type="checkbox"
                        checked={expertise}
                        onChange={() => toggleSkillExpertise(skill.key)}
                        disabled={!isOwner || !proficient}
                      />
                      <span className="checkmark expertise"></span>
                    </label>
                  </div>
                  
                  <div className="skill-bonus">
                    {formatModifier(bonus)}
                  </div>
                  
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-ability">({skill.abbrev})</span>
                  </div>
                  
                  <div className="skill-breakdown">
                    {proficient && <span className="prof-indicator" title="Proficient">●</span>}
                    {expertise && <span className="exp-indicator" title="Expertise">◆</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saving Throws Section */}
        <div className="saves-section">
          <h4>Saving Throws</h4>
          <div className="saves-list">
            {savingThrows.map((save) => {
              const bonus = getSaveBonus(save);
              const proficient = stats.saveProficiencies?.[save.key] || false;
              
              return (
                <div key={save.key} className="save-row">
                  <div className="save-proficiency">
                    <label className="proficiency-checkbox">
                      <input
                        type="checkbox"
                        checked={proficient}
                        onChange={() => toggleSaveProficiency(save.key)}
                        disabled={!isOwner}
                      />
                      <span className="checkmark proficient"></span>
                    </label>
                  </div>
                  
                  <div className="save-bonus">
                    {formatModifier(bonus)}
                  </div>
                  
                  <div className="save-info">
                    <span className="save-name">{save.name}</span>
                    <span className="save-ability">({save.abbrev})</span>
                  </div>
                  
                  <div className="save-breakdown">
                    {proficient && <span className="prof-indicator" title="Proficient">●</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Other Proficiencies Section */}
      <div className="other-proficiencies">
        <h4>Other Proficiencies & Languages</h4>
        
        <div className="proficiency-category">
          <label htmlFor="armor-prof">Armor</label>
          <textarea
            id="armor-prof"
            value={stats.armorProficiencies || ''}
            onChange={(e) => onStatsChange({ armorProficiencies: e.target.value })}
            disabled={!isOwner}
            className="prof-textarea"
            placeholder="Light armor, medium armor, shields..."
            rows="2"
          />
        </div>

        <div className="proficiency-category">
          <label htmlFor="weapon-prof">Weapons</label>
          <textarea
            id="weapon-prof"
            value={stats.weaponProficiencies || ''}
            onChange={(e) => onStatsChange({ weaponProficiencies: e.target.value })}
            disabled={!isOwner}
            className="prof-textarea"
            placeholder="Simple weapons, martial weapons, shortswords..."
            rows="2"
          />
        </div>

        <div className="proficiency-category">
          <label htmlFor="tool-prof">Tools</label>
          <textarea
            id="tool-prof"
            value={stats.toolProficiencies || ''}
            onChange={(e) => onStatsChange({ toolProficiencies: e.target.value })}
            disabled={!isOwner}
            className="prof-textarea"
            placeholder="Thieves' tools, herbalism kit, smith's tools..."
            rows="2"
          />
        </div>

        <div className="proficiency-category">
          <label htmlFor="languages">Languages</label>
          <textarea
            id="languages"
            value={stats.languages || ''}
            onChange={(e) => onStatsChange({ languages: e.target.value })}
            disabled={!isOwner}
            className="prof-textarea"
            placeholder="Common, Elvish, Draconic..."
            rows="2"
          />
        </div>
      </div>

      {/* Passive Perception */}
      <div className="passive-skills">
        <h4>Passive Skills</h4>
        <div className="passive-skills-grid">
          <div className="passive-skill">
            <span className="passive-label">Passive Perception</span>
            <span className="passive-value">{10 + getSkillBonus(skills.find(s => s.key === 'perception'))}</span>
          </div>
          <div className="passive-skill">
            <span className="passive-label">Passive Investigation</span>
            <span className="passive-value">{10 + getSkillBonus(skills.find(s => s.key === 'investigation'))}</span>
          </div>
          <div className="passive-skill">
            <span className="passive-label">Passive Insight</span>
            <span className="passive-value">{10 + getSkillBonus(skills.find(s => s.key === 'insight'))}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="proficiency-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="prof-indicator">●</span>
            <span>Proficient (add proficiency bonus)</span>
          </div>
          <div className="legend-item">
            <span className="exp-indicator">◆</span>
            <span>Expertise (double proficiency bonus)</span>
          </div>
        </div>
        <p className="legend-note">
          Note: Expertise can only be applied to skills you are proficient in.
        </p>
      </div>
    </div>
  );
};

export default SkillsProficiencies;
