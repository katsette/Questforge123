import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  UserIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

const ChatInput = ({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop, 
  campaignCharacters = [], 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const characterSelectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (characterSelectRef.current && !characterSelectRef.current.contains(event.target)) {
        setShowCharacterSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Typing indicators
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    // Clear existing timeout and set new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;

    // Clear typing state
    if (isTyping) {
      setIsTyping(false);
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    // Send message
    onSendMessage(message.trim(), selectedCharacter?.id);
    
    // Reset form
    setMessage('');
    setSelectedCharacter(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const selectCharacter = (character) => {
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
  };

  const clearCharacter = () => {
    setSelectedCharacter(null);
  };

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        {/* Character Selection */}
        {selectedCharacter && (
          <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {selectedCharacter.name[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Speaking as {selectedCharacter.name}
              </span>
            </div>
            <button
              type="button"
              onClick={clearCharacter}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-end space-x-3">
          {/* Character Select Button */}
          {campaignCharacters.length > 0 && (
            <div className="relative" ref={characterSelectRef}>
              <button
                type="button"
                onClick={() => setShowCharacterSelect(!showCharacterSelect)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedCharacter
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                disabled={disabled}
                title="Select character to speak as"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {showCharacterSelect && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                      Speak as:
                    </div>
                    
                    {/* Speak as yourself */}
                    <button
                      type="button"
                      onClick={() => selectCharacter(null)}
                      className={`flex items-center space-x-2 w-full px-2 py-2 text-sm rounded transition-colors ${
                        !selectedCharacter
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3" />
                      </div>
                      <span>Yourself</span>
                    </button>

                    {/* Character options */}
                    {campaignCharacters.map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => selectCharacter(character)}
                        className={`flex items-center space-x-2 w-full px-2 py-2 text-sm rounded transition-colors ${
                          selectedCharacter?.id === character.id
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                            {character.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{character.name}</div>
                          {character.class && character.level && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Level {character.level} {character.class}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Chat is disconnected..." : "Type a message... (Enter to send, Shift+Enter for new line)"}
              disabled={disabled}
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              rows="1"
              maxLength="2000"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />

            {/* Character count */}
            {message.length > 1500 && (
              <div className={`absolute bottom-2 right-12 text-xs ${
                message.length > 1900 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Help text */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Enter to send, Shift+Enter for new line</span>
          {disabled && <span className="text-red-500">Disconnected</span>}
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
