const Message = require('../models/Message');
const Campaign = require('../models/Campaign');

const chatHandlers = (socket, io) => {
  // Join campaign chat room
  socket.on('join-campaign-chat', async (data) => {
    try {
      const { campaignId, room = 'general' } = data;
      
      // Verify user has access to this campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.emit('error', { message: 'Campaign not found' });
        return;
      }

      // Check if user is part of campaign
      const isAuthorized = await Campaign.isMember(campaignId, socket.userId);

      if (!isAuthorized) {
        socket.emit('error', { message: 'Not authorized to access this campaign' });
        return;
      }

      // Join the room
      const roomName = `campaign:${campaignId}:${room}`;
      socket.join(roomName);
      
      console.log(`User ${socket.userId} joined chat room: ${roomName}`);
      
      // Send recent messages
      const recentMessages = await Message.getRecentMessages(campaignId, 50);
      socket.emit('chat-history', { 
        room, 
        messages: recentMessages 
      });

      // Notify others in the room
      socket.to(roomName).emit('user-joined-chat', {
        userId: socket.userId,
        room
      });

    } catch (error) {
      console.error('Join campaign chat error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Leave campaign chat room
  socket.on('leave-campaign-chat', (data) => {
    try {
      const { campaignId, room = 'general' } = data;
      const roomName = `campaign:${campaignId}:${room}`;
      
      socket.leave(roomName);
      
      // Notify others in the room
      socket.to(roomName).emit('user-left-chat', {
        userId: socket.userId,
        room
      });

    } catch (error) {
      console.error('Leave campaign chat error:', error);
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { campaignId, room = 'general', content, type = 'message', characterId } = data;
      
      if (!content || content.trim().length === 0) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      if (content.length > 2000) {
        socket.emit('error', { message: 'Message too long (max 2000 characters)' });
        return;
      }

      // Create new message
      const message = await Message.create({
        content: content.trim(),
        userId: socket.userId,
        campaignId: campaignId,
        characterId: characterId || null,
        type,
        isSystemMessage: type === 'system'
      });

      const roomName = `campaign:${campaignId}:${room}`;
      
      // Broadcast message to room
      io.to(roomName).emit('new-message', message);

      console.log(`Message sent in ${roomName} by ${socket.userId}`);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Edit message
  socket.on('edit-message', async (data) => {
    try {
      const { messageId, campaignId, content } = data;
      
      if (!content || content.trim().length === 0) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      const message = await Message.findById(messageId, campaignId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Check if user owns the message
      if (message.userId !== socket.userId) {
        socket.emit('error', { message: 'Not authorized to edit this message' });
        return;
      }

      // Check if message is not too old (e.g., 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (new Date(message.createdAt.toDate()) < fifteenMinutesAgo) {
        socket.emit('error', { message: 'Message too old to edit' });
        return;
      }

      const updatedMessage = await Message.updateById(messageId, campaignId, { content: content.trim() });

      const roomName = `campaign:${campaignId}:${data.room || 'general'}`;
      io.to(roomName).emit('message-edited', updatedMessage);

    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Delete message
  socket.on('delete-message', async (data) => {
    try {
      const { messageId, campaignId } = data;
      
      const message = await Message.findById(messageId, campaignId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Check if user owns the message or is GM
      const campaign = await Campaign.findById(campaignId);
      const isGM = campaign.dmId === socket.userId;
      const isOwner = message.userId === socket.userId;

      if (!isOwner && !isGM) {
        socket.emit('error', { message: 'Not authorized to delete this message' });
        return;
      }

      await Message.deleteById(messageId, campaignId);

      const roomName = `campaign:${campaignId}:${data.room || 'general'}`;
      io.to(roomName).emit('message-deleted', { messageId, deletedBy: socket.userId });

    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Add reaction to message (simplified - we'll implement reactions later)
  socket.on('add-reaction', async (data) => {
    try {
      const { messageId, campaignId, emoji } = data;
      
      const message = await Message.findById(messageId, campaignId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // For now, just emit the reaction without storing it
      const roomName = `campaign:${campaignId}:${data.room || 'general'}`;
      io.to(roomName).emit('reaction-added', { 
        messageId, 
        emoji, 
        userId: socket.userId, 
      });

    } catch (error) {
      console.error('Add reaction error:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // Remove reaction from message (simplified)
  socket.on('remove-reaction', async (data) => {
    try {
      const { messageId, campaignId, emoji } = data;
      
      const message = await Message.findById(messageId, campaignId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // For now, just emit the reaction removal without storing it
      const roomName = `campaign:${campaignId}:${data.room || 'general'}`;
      io.to(roomName).emit('reaction-removed', { 
        messageId, 
        emoji, 
        userId: socket.userId 
      });

    } catch (error) {
      console.error('Remove reaction error:', error);
      socket.emit('error', { message: 'Failed to remove reaction' });
    }
  });

  // Typing indicator
  socket.on('typing-start', (data) => {
    const { campaignId, room = 'general' } = data;
    const roomName = `campaign:${campaignId}:${room}`;
    
    socket.to(roomName).emit('user-typing-start', {
      userId: socket.userId,
    });
  });

  socket.on('typing-stop', (data) => {
    const { campaignId, room = 'general' } = data;
    const roomName = `campaign:${campaignId}:${room}`;
    
    socket.to(roomName).emit('user-typing-stop', {
      userId: socket.userId,
    });
  });
};

module.exports = chatHandlers;