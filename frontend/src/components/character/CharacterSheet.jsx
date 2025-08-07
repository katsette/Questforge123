import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BasicInfo from './BasicInfo';
import AbilityScores from './AbilityScores';
import SkillsProficiencies from './SkillsProficiencies';
import CombatStats from './CombatStats';
import Equipment from './Equipment';
import SpellsFeatures from './SpellsFeatures';
import Notes from './Notes';
import './CharacterSheet.css';

const CharacterSheet = ({ characterId, isOwner = false, onCharacterUpdate }) => {
  const { authFetch } = useAuth();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (characterId) {
      fetchCharacter();
    }
  }, [characterId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/characters/${characterId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch character');
      }

      const data = await response.json();
      setCharacter(data.character);
      setError('');
    } catch (error) {
      console.error('Fetch character error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCharacter = async (updates, showSuccessMessage = true) => {
    if (!isOwner) return;

    try {
      setSaving(true);
      setError('');

      const response = await authFetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update character');
      }

      const data = await response.json();
      setCharacter(data.character);
      setHasUnsavedChanges(false);

      if (onCharacterUpdate) {
        onCharacterUpdate(data.character);
      }

      if (showSuccessMessage) {
        // You could add a toast notification here
        console.log('Character updated successfully');
      }
    } catch (error) {
      console.error('Update character error:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (!isOwner) return;

    setCharacter(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleStatsChange = (newStats) => {
    if (!isOwner) return;

    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, ...newStats }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!hasUnsavedChanges) return;

    updateCharacter({
      name: character.name,
      class: character.class,
      race: character.race,
      background: character.background,
      level: character.level,
      stats: character.stats
    });
  };

  const handleLevelUp = async () => {
    if (!isOwner || character.level >= 20) return;

    try {
      setSaving(true);
      const response = await authFetch(`/api/characters/${characterId}/level-up`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to level up character');
      }

      const data = await response.json();
      setCharacter(data.character);
      
      if (onCharacterUpdate) {
        onCharacterUpdate(data.character);
      }
    } catch (error) {
      console.error('Level up error:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="character-sheet-loading">
        <div className="loading-spinner"></div>
        <p>Loading character sheet...</p>
      </div>
    );
  }

  if (error && !character) {
    return (
      <div className="character-sheet-error">
        <h3>Error Loading Character</h3>
        <p>{error}</p>
        <button onClick={fetchCharacter} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="character-sheet-empty">
        <p>Character not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'abilities', label: 'Abilities', icon: '💪' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'equipment', label: 'Equipment', icon: '🎒' },
    { id: 'spells', label: 'Spells & Features', icon: '✨' },
    { id: 'notes', label: 'Notes', icon: '📝' }
  ];

  return (
    <div className="character-sheet">
      {/* Header */}
      <div className="character-sheet-header">
        <div className="character-header-info">
          <h1 className="character-name">{character.name}</h1>
          <div className="character-subtitle">
            Level {character.level} {character.race} {character.class}
            {character.background && ` • ${character.background}`}
          </div>
          {character.campaignName && (
            <div className="campaign-tag">
              Campaign: {character.campaignName}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="character-actions">
            {hasUnsavedChanges && (
              <button 
                onClick={handleSave}
                disabled={saving}
                className="save-button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            
            {character.level < 20 && (
              <button 
                onClick={handleLevelUp}
                disabled={saving}
                className="level-up-button"
              >
                Level Up!
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="character-sheet-error-banner">
          <p>{error}</p>
          <button onClick={() => setError('')} className="dismiss-error">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="character-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="character-content">
        {activeTab === 'basic' && (
          <BasicInfo
            character={character}
            isOwner={isOwner}
            onFieldChange={handleFieldChange}
            onStatsChange={handleStatsChange}
          />
        )}
        
        {activeTab === 'abilities' && (
          <AbilityScores
            character={character}
            isOwner={isOwner}
            onStatsChange={handleStatsChange}
          />
        )}
        
        {activeTab === 'skills' && (
          <SkillsProficiencies
            character={character}
            isOwner={isOwner}
            onStatsChange={handleStatsChange}
          />
        )}
        
        {activeTab === 'combat' && (
          <CombatStats
            character={character}
            isOwner={isOwner}
            onStatsChange={handleStatsChange}
          />
        )}
        
        {activeTab === 'equipment' && (
          <Equipment
            character={character}
            isOwner={isOwner}
            onStatsChange={handleStatsChange}
          />
        )}
        
        {activeTab === 'spells' && (
          <SpellsFeatures
            character={character}
            isOwner={isOwner}
            onStatsChange={handleStatsChange}
          />
        )}
        
        {activeTab === 'notes' && (
          <Notes
            character={character}
            isOwner={isOwner}
            onStatsChange={handleStatsChange}
          />
        )}
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="auto-save-indicator">
          <div className="save-spinner"></div>
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
};

export default CharacterSheet;
