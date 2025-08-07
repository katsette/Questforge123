import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SERVER_URL = process.env.REACT_APP_API_URL || 
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

    this.socket = io(SERVER_URL, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  getSocket() {
    return this.socket;
  }

  // Campaign events
  joinCampaign(campaignId) {
    if (this.socket) {
      this.socket.emit('join-campaign', { campaignId });
    }
  }

  leaveCampaign(campaignId) {
    if (this.socket) {
      this.socket.emit('leave-campaign', { campaignId });
    }
  }

  onCampaignUpdate(callback) {
    if (this.socket) {
      this.socket.on('campaign-updated', callback);
    }
  }

  onCharacterUpdate(callback) {
    if (this.socket) {
      this.socket.on('character-updated', callback);
    }
  }

  // Chat events
  joinCampaignChat(campaignId, room = 'general') {
    if (this.socket) {
      this.socket.emit('join-campaign-chat', { campaignId, room });
    }
  }

  leaveCampaignChat(campaignId, room = 'general') {
    if (this.socket) {
      this.socket.emit('leave-campaign-chat', { campaignId, room });
    }
  }

  sendMessage(campaignId, room, content, type = 'message', characterId = null) {
    if (this.socket) {
      this.socket.emit('send-message', {
        campaignId,
        room,
        content,
        type,
        characterId
      });
    }
  }

  editMessage(messageId, content) {
    if (this.socket) {
      this.socket.emit('edit-message', { messageId, content });
    }
  }

  deleteMessage(messageId) {
    if (this.socket) {
      this.socket.emit('delete-message', { messageId });
    }
  }

  addReaction(messageId, emoji) {
    if (this.socket) {
      this.socket.emit('add-reaction', { messageId, emoji });
    }
  }

  removeReaction(messageId, emoji) {
    if (this.socket) {
      this.socket.emit('remove-reaction', { messageId, emoji });
    }
  }

  startTyping(campaignId, room = 'general') {
    if (this.socket) {
      this.socket.emit('typing-start', { campaignId, room });
    }
  }

  stopTyping(campaignId, room = 'general') {
    if (this.socket) {
      this.socket.emit('typing-stop', { campaignId, room });
    }
  }

  // Chat event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onMessageEdited(callback) {
    if (this.socket) {
      this.socket.on('message-edited', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message-deleted', callback);
    }
  }

  onChatHistory(callback) {
    if (this.socket) {
      this.socket.on('chat-history', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing-start', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing-stop', callback);
    }
  }

  onReactionAdded(callback) {
    if (this.socket) {
      this.socket.on('reaction-added', callback);
    }
  }

  onReactionRemoved(callback) {
    if (this.socket) {
      this.socket.on('reaction-removed', callback);
    }
  }

  // Dice events
  rollDice(campaignId, roll, isPrivate = false) {
    if (this.socket) {
      this.socket.emit('campaign-dice-roll', { campaignId, roll, isPrivate });
    }
  }

  onPublicDiceRoll(callback) {
    if (this.socket) {
      this.socket.on('public-dice-roll', callback);
    }
  }

  onPrivateDiceRoll(callback) {
    if (this.socket) {
      this.socket.on('private-dice-roll', callback);
    }
  }

  onDiceRollSent(callback) {
    if (this.socket) {
      this.socket.on('dice-roll-sent', callback);
    }
  }

  // Session management
  onSessionStatusChange(callback) {
    if (this.socket) {
      this.socket.on('session-status-changed', callback);
    }
  }

  changeSessionStatus(campaignId, status, sessionData = {}) {
    if (this.socket) {
      this.socket.emit('session-status-change', { campaignId, status, sessionData });
    }
  }

  // User presence
  onUserJoinedCampaign(callback) {
    if (this.socket) {
      this.socket.on('user-joined-campaign', callback);
    }
  }

  onUserLeftCampaign(callback) {
    if (this.socket) {
      this.socket.on('user-left-campaign', callback);
    }
  }

  onUserJoinedChat(callback) {
    if (this.socket) {
      this.socket.on('user-joined-chat', callback);
    }
  }

  onUserLeftChat(callback) {
    if (this.socket) {
      this.socket.on('user-left-chat', callback);
    }
  }

  // Initiative tracking
  updateInitiative(campaignId, initiative) {
    if (this.socket) {
      this.socket.emit('initiative-update', { campaignId, initiative });
    }
  }

  onInitiativeUpdated(callback) {
    if (this.socket) {
      this.socket.on('initiative-updated', callback);
    }
  }

  // Utility methods
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export { socketService };
