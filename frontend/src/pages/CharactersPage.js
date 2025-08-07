import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, UserIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CharactersPage = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    class: '',
    race: '',
    background: '',
    level: 1
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/characters');
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }

      const data = await response.json();
      setCharacters(data.characters || []);
    } catch (error) {
      console.error('Fetch characters error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    
    try {
      const response = await authFetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCharacter)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create character');
      }

      const data = await response.json();
      setCharacters([...characters, data.character]);
      setShowCreateModal(false);
      setNewCharacter({ name: '', class: '', race: '', background: '', level: 1 });
      
      // Navigate to the new character sheet
      navigate(`/characters/${data.character.id}`);
    } catch (error) {
      console.error('Create character error:', error);
      setError(error.message);
    }
  };

  const handleDeleteCharacter = async (characterId) => {
    if (!window.confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/characters/${characterId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      setCharacters(characters.filter(char => char.id !== characterId));
    } catch (error) {
      console.error('Delete character error:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Characters</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your D&D characters
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Character
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Characters Grid */}
      {characters.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Characters Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first character to get started!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Character
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div key={character.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {character.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Level {character.level} {character.race} {character.class}
                  </p>
                  {character.background && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {character.background}
                    </p>
                  )}
                </div>
                <UserIcon className="w-12 h-12 text-gray-400" />
              </div>
              
              {character.campaignName && (
                <div className="mb-4">
                  <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded">
                    {character.campaignName}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Link
                  to={`/characters/${character.id}`}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View Sheet
                </Link>
                <button
                  onClick={() => handleDeleteCharacter(character.id)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Character Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Character
            </h2>
            
            <form onSubmit={handleCreateCharacter}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Class *
                    </label>
                    <input
                      type="text"
                      value={newCharacter.class}
                      onChange={(e) => setNewCharacter({ ...newCharacter, class: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Race *
                    </label>
                    <input
                      type="text"
                      value={newCharacter.race}
                      onChange={(e) => setNewCharacter({ ...newCharacter, race: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background
                  </label>
                  <input
                    type="text"
                    value={newCharacter.background}
                    onChange={(e) => setNewCharacter({ ...newCharacter, background: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Starting Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCharacter.level}
                    onChange={(e) => setNewCharacter({ ...newCharacter, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Character
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
