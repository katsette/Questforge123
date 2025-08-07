import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CharacterSheet from '../components/character/CharacterSheet';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CharacterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCharacter();
    }
  }, [id]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/characters/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Character not found');
        } else if (response.status === 403) {
          setError('You do not have permission to view this character');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load character');
        }
        return;
      }

      const data = await response.json();
      setCharacter(data.character);
      setIsOwner(data.character.userId === user?.id);
      setError('');
    } catch (error) {
      console.error('Fetch character error:', error);
      setError('Failed to load character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    setCharacter(updatedCharacter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <span className="text-6xl mb-4 block">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Character Not Available
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/characters')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Characters
          </button>
          <button
            onClick={fetchCharacter}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <CharacterSheet
      characterId={id}
      isOwner={isOwner}
      onCharacterUpdate={handleCharacterUpdate}
    />
  );
};

export default CharacterDetailPage;
