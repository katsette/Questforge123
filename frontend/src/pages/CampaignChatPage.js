import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socketService';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import ChatUserList from '../components/chat/ChatUserList';
import TypingIndicator from '../components/chat/TypingIndicator';

const CampaignChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setCampaign(data.campaign);
        } else {
          setError(data.error || 'Failed to load campaign');
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id]);

  // Socket connection and chat setup
  useEffect(() => {
    if (!campaign || !user) return;

    const setupChat = async () => {
      try {
        // Connect to socket if not already connected
        if (!socketService.socket?.connected) {
          await socketService.connect();
        }

        // Join campaign chat
        socketService.socket.emit('join-campaign-chat', {
          campaignId: id,
          room: 'general'
        });

        setConnected(true);

        // Set up event listeners
        socketService.socket.on('chat-history', (data) => {
          setMessages(data.messages || []);
          setTimeout(scrollToBottom, 100);
        });

        socketService.socket.on('new-message', (message) => {
          setMessages(prev => [...prev, message]);
          setTimeout(scrollToBottom, 100);
        });

        socketService.socket.on('message-edited', (editedMessage) => {
          setMessages(prev => prev.map(msg => 
            msg.id === editedMessage.id ? editedMessage : msg
          ));
        });

        socketService.socket.on('message-deleted', ({ messageId }) => {
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
        });

        socketService.socket.on('user-joined-chat', ({ username, userId }) => {
          setOnlineUsers(prev => {
            if (!prev.find(u => u.id === userId)) {
              return [...prev, { id: userId, username }];
            }
            return prev;
          });
        });

        socketService.socket.on('user-left-chat', ({ userId }) => {
          setOnlineUsers(prev => prev.filter(u => u.id !== userId));
        });

        socketService.socket.on('user-typing-start', ({ username, userId }) => {
          setTypingUsers(prev => {
            if (!prev.find(u => u.id === userId)) {
              return [...prev, { id: userId, username }];
            }
            return prev;
          });
        });

        socketService.socket.on('user-typing-stop', ({ userId }) => {
          setTypingUsers(prev => prev.filter(u => u.id !== userId));
        });

        socketService.socket.on('reaction-added', ({ messageId, emoji, userId, username }) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
              const reactions = msg.reactions || {};
              if (!reactions[emoji]) {
                reactions[emoji] = [];
              }
              if (!reactions[emoji].find(r => r.userId === userId)) {
                reactions[emoji].push({ userId, username });
              }
              return { ...msg, reactions };
            }
            return msg;
          }));
        });

        socketService.socket.on('reaction-removed', ({ messageId, emoji, userId }) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
              const reactions = { ...(msg.reactions || {}) };
              if (reactions[emoji]) {
                reactions[emoji] = reactions[emoji].filter(r => r.userId !== userId);
                if (reactions[emoji].length === 0) {
                  delete reactions[emoji];
                }
              }
              return { ...msg, reactions };
            }
            return msg;
          }));
        });

        socketService.socket.on('error', ({ message }) => {
          console.error('Chat error:', message);
          setError(message);
        });

      } catch (err) {
        console.error('Error setting up chat:', err);
        setError('Failed to connect to chat');
        setConnected(false);
      }
    };

    setupChat();

    // Cleanup on unmount
    return () => {
      if (socketService.socket) {
        socketService.socket.emit('leave-campaign-chat', {
          campaignId: id,
          room: 'general'
        });
        
        // Remove listeners
        socketService.socket.off('chat-history');
        socketService.socket.off('new-message');
        socketService.socket.off('message-edited');
        socketService.socket.off('message-deleted');
        socketService.socket.off('user-joined-chat');
        socketService.socket.off('user-left-chat');
        socketService.socket.off('user-typing-start');
        socketService.socket.off('user-typing-stop');
        socketService.socket.off('reaction-added');
        socketService.socket.off('reaction-removed');
        socketService.socket.off('error');
      }
    };
  }, [campaign, user, id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content, characterId = null) => {
    if (!connected || !content.trim()) return;

    socketService.socket.emit('send-message', {
      campaignId: id,
      room: 'general',
      content: content.trim(),
      type: 'message',
      characterId
    });
  };

  const handleEditMessage = (messageId, newContent) => {
    if (!connected || !newContent.trim()) return;

    socketService.socket.emit('edit-message', {
      messageId,
      content: newContent.trim()
    });
  };

  const handleDeleteMessage = (messageId) => {
    if (!connected) return;

    socketService.socket.emit('delete-message', {
      messageId
    });
  };

  const handleAddReaction = (messageId, emoji) => {
    if (!connected) return;

    socketService.socket.emit('add-reaction', {
      messageId,
      emoji
    });
  };

  const handleRemoveReaction = (messageId, emoji) => {
    if (!connected) return;

    socketService.socket.emit('remove-reaction', {
      messageId,
      emoji
    });
  };

  const handleTypingStart = () => {
    if (connected) {
      socketService.socket.emit('typing-start', {
        campaignId: id,
        room: 'general'
      });
    }
  };

  const handleTypingStop = () => {
    if (connected) {
      socketService.socket.emit('typing-stop', {
        campaignId: id,
        room: 'general'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Chat Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate(`/campaigns/${id}`)}
            className="btn-secondary"
          >
            Back to Campaign
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Campaign Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The campaign you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/campaigns" className="btn-primary">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/campaigns/${id}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {campaign.name} - Chat
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{connected ? 'Connected' : 'Disconnected'}</span>
                {onlineUsers.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{onlineUsers.length} online</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors md:hidden"
          >
            <UserGroupIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages List */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  currentUser={user}
                  isGM={campaign.dmId === user?.id}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                />
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <TypingIndicator users={typingUsers} />
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            campaignCharacters={campaign.characters || []}
            disabled={!connected}
          />
        </div>

        {/* User List Sidebar */}
        <ChatUserList
          users={onlineUsers}
          campaignMembers={campaign.members || []}
          show={showUserList}
          onClose={() => setShowUserList(false)}
        />
      </div>
    </div>
  );
};

export default CampaignChatPage;
