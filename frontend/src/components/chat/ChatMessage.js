import React, { useState, useRef, useEffect } from 'react';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_EMOJIS = ['👍', '👎', '😄', '😢', '😍', '🔥', '👏', '❤️'];

const ChatMessage = ({ 
  message, 
  currentUser, 
  isGM, 
  onEdit, 
  onDelete, 
  onAddReaction, 
  onRemoveReaction 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const actionsRef = useRef(null);
  const emojiRef = useRef(null);
  const editInputRef = useRef(null);

  const isOwner = message.userId === currentUser?.id;
  const canEdit = isOwner && message.type !== 'system';
  const canDelete = isOwner || isGM;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleReactionClick = (emoji) => {
    const userReaction = message.reactions?.[emoji]?.find(r => r.userId === currentUser?.id);
    
    if (userReaction) {
      onRemoveReaction(message.id, emoji);
    } else {
      onAddReaction(message.id, emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message.id);
    }
    setShowActions(false);
  };

  // System message rendering
  if (message.type === 'system' || message.isSystemMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex justify-center my-2"
      >
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start space-x-3 group ${isOwner ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {message.username?.[0]?.toUpperCase() || message.characterName?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwner ? 'text-right' : 'text-left'}`}>
        {/* Message Header */}
        <div className={`flex items-baseline space-x-2 mb-1 ${isOwner ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message.characterName || message.username || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              (edited)
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
              isOwner
                ? 'bg-primary-600 text-white ml-auto'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-auto border border-gray-200 dark:border-gray-600'
            }`}
          >
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-2">
                <textarea
                  ref={editInputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded resize-none"
                  rows="2"
                  maxLength="2000"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            )}
          </div>

          {/* Message Actions */}
          {!isEditing && (canEdit || canDelete) && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative" ref={actionsRef}>
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                    >
                      {canEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowActions(false);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className={`flex items-center space-x-2 mt-1 ${isOwner ? 'justify-end' : 'justify-start'}`}>
          {/* Existing Reactions */}
          {message.reactions && Object.entries(message.reactions).length > 0 && (
            <div className="flex items-center space-x-1">
              {Object.entries(message.reactions).map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    reactions.find(r => r.userId === currentUser?.id)
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{reactions.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Add Reaction Button */}
          {!isEditing && (
            <div className="relative" ref={emojiRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FaceSmileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 z-10"
                  >
                    <div className="grid grid-cols-4 gap-1">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReactionClick(emoji)}
                          className="p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
