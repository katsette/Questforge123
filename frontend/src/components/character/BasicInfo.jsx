import React from 'react';

const BasicInfo = ({ character, isOwner, onFieldChange, onStatsChange }) => {
  const stats = character.stats || {};

  const dndClasses = [
    'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
    'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
  ];

  const dndRaces = [
    'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling',
    'Human', 'Tiefling', 'Aarakocra', 'Genasi', 'Goliath', 'Aasimar', 'Tabaxi'
  ];

  const backgrounds = [
    'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier',
    'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'
  ];

  const alignments = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
  ];

  const handleStatsUpdate = (field, value) => {
    onStatsChange({ [field]: value });
  };

  return (
    <div className="basic-info">
      <div className="info-grid">
        {/* Basic Character Info */}
        <div className="info-section">
          <h3>Character Details</h3>
          
          <div className="form-group">
            <label htmlFor="character-name">Character Name</label>
            <input
              id="character-name"
              type="text"
              value={character.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              disabled={!isOwner}
              className="form-input"
              maxLength="50"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="character-class">Class</label>
              <select
                id="character-class"
                value={character.class || ''}
                onChange={(e) => onFieldChange('class', e.target.value)}
                disabled={!isOwner}
                className="form-select"
              >
                <option value="">Select Class</option>
                {dndClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="character-level">Level</label>
              <input
                id="character-level"
                type="number"
                min="1"
                max="20"
                value={character.level || 1}
                onChange={(e) => onFieldChange('level', parseInt(e.target.value))}
                disabled={!isOwner}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="character-race">Race</label>
            <select
              id="character-race"
              value={character.race || ''}
              onChange={(e) => onFieldChange('race', e.target.value)}
              disabled={!isOwner}
              className="form-select"
            >
              <option value="">Select Race</option>
              {dndRaces.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="character-background">Background</label>
            <select
              id="character-background"
              value={character.background || ''}
              onChange={(e) => onFieldChange('background', e.target.value)}
              disabled={!isOwner}
              className="form-select"
            >
              <option value="">Select Background</option>
              {backgrounds.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="character-alignment">Alignment</label>
            <select
              id="character-alignment"
              value={stats.alignment || ''}
              onChange={(e) => handleStatsUpdate('alignment', e.target.value)}
              disabled={!isOwner}
              className="form-select"
            >
              <option value="">Select Alignment</option>
              {alignments.map(align => (
                <option key={align} value={align}>{align}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience and Proficiency */}
        <div className="info-section">
          <h3>Experience & Proficiency</h3>
          
          <div className="form-group">
            <label htmlFor="experience-points">Experience Points</label>
            <input
              id="experience-points"
              type="number"
              min="0"
              value={stats.experiencePoints || 0}
              onChange={(e) => handleStatsUpdate('experiencePoints', parseInt(e.target.value) || 0)}
              disabled={!isOwner}
              className="form-input"
            />
          </div>

          <div className="proficiency-bonus">
            <label>Proficiency Bonus</label>
            <div className="bonus-display">
              +{Math.ceil(character.level / 4) + 1}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="inspiration">Inspiration</label>
            <input
              id="inspiration"
              type="checkbox"
              checked={stats.inspiration || false}
              onChange={(e) => handleStatsUpdate('inspiration', e.target.checked)}
              disabled={!isOwner}
              className="form-checkbox"
            />
          </div>
        </div>

        {/* Physical Description */}
        <div className="info-section">
          <h3>Physical Description</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="character-age">Age</label>
              <input
                id="character-age"
                type="number"
                min="1"
                value={stats.age || ''}
                onChange={(e) => handleStatsUpdate('age', parseInt(e.target.value) || '')}
                disabled={!isOwner}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="character-height">Height</label>
              <input
                id="character-height"
                type="text"
                value={stats.height || ''}
                onChange={(e) => handleStatsUpdate('height', e.target.value)}
                disabled={!isOwner}
                className="form-input"
                placeholder="5'8&quot;"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="character-weight">Weight</label>
              <input
                id="character-weight"
                type="text"
                value={stats.weight || ''}
                onChange={(e) => handleStatsUpdate('weight', e.target.value)}
                disabled={!isOwner}
                className="form-input"
                placeholder="150 lbs"
              />
            </div>

            <div className="form-group">
              <label htmlFor="character-eyes">Eyes</label>
              <input
                id="character-eyes"
                type="text"
                value={stats.eyes || ''}
                onChange={(e) => handleStatsUpdate('eyes', e.target.value)}
                disabled={!isOwner}
                className="form-input"
                placeholder="Brown"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="character-skin">Skin</label>
              <input
                id="character-skin"
                type="text"
                value={stats.skin || ''}
                onChange={(e) => handleStatsUpdate('skin', e.target.value)}
                disabled={!isOwner}
                className="form-input"
                placeholder="Tan"
              />
            </div>

            <div className="form-group">
              <label htmlFor="character-hair">Hair</label>
              <input
                id="character-hair"
                type="text"
                value={stats.hair || ''}
                onChange={(e) => handleStatsUpdate('hair', e.target.value)}
                disabled={!isOwner}
                className="form-input"
                placeholder="Black"
              />
            </div>
          </div>
        </div>

        {/* Backstory */}
        <div className="info-section full-width">
          <h3>Character Backstory</h3>
          
          <div className="form-group">
            <label htmlFor="personality-traits">Personality Traits</label>
            <textarea
              id="personality-traits"
              value={stats.personalityTraits || ''}
              onChange={(e) => handleStatsUpdate('personalityTraits', e.target.value)}
              disabled={!isOwner}
              className="form-textarea"
              rows="3"
              placeholder="Describe your character's personality traits..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="ideals">Ideals</label>
            <textarea
              id="ideals"
              value={stats.ideals || ''}
              onChange={(e) => handleStatsUpdate('ideals', e.target.value)}
              disabled={!isOwner}
              className="form-textarea"
              rows="2"
              placeholder="What drives your character?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bonds">Bonds</label>
            <textarea
              id="bonds"
              value={stats.bonds || ''}
              onChange={(e) => handleStatsUpdate('bonds', e.target.value)}
              disabled={!isOwner}
              className="form-textarea"
              rows="2"
              placeholder="Important connections, people, places, or events"
            />
          </div>

          <div className="form-group">
            <label htmlFor="flaws">Flaws</label>
            <textarea
              id="flaws"
              value={stats.flaws || ''}
              onChange={(e) => handleStatsUpdate('flaws', e.target.value)}
              disabled={!isOwner}
              className="form-textarea"
              rows="2"
              placeholder="Character weaknesses or vices"
            />
          </div>

          <div className="form-group">
            <label htmlFor="backstory">Backstory</label>
            <textarea
              id="backstory"
              value={stats.backstory || ''}
              onChange={(e) => handleStatsUpdate('backstory', e.target.value)}
              disabled={!isOwner}
              className="form-textarea"
              rows="5"
              placeholder="Tell your character's story..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
