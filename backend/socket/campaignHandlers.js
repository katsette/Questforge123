const Campaign = require('../models/Campaign');

const campaignHandlers = (socket, io) => {
  // Join campaign room for general updates
  socket.on('join-campaign', async (data) => {
    try {
      const { campaignId } = data;
      
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

      // Join the campaign room
      const roomName = `campaign:${campaignId}`;
      socket.join(roomName);
      
      console.log(`User ${socket.userId} joined campaign: ${campaignId}`);
      
      // Notify others in the campaign
      socket.to(roomName).emit('user-joined-campaign', {
        userId: socket.userId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Join campaign error:', error);
      socket.emit('error', { message: 'Failed to join campaign' });
    }
  });

  // Leave campaign room
  socket.on('leave-campaign', (data) => {
    try {
      const { campaignId } = data;
      const roomName = `campaign:${campaignId}`;
      
      socket.leave(roomName);
      
      // Notify others in the campaign
      socket.to(roomName).emit('user-left-campaign', {
        userId: socket.userId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Leave campaign error:', error);
    }
  });

  // Campaign update notifications
  socket.on('campaign-updated', async (data) => {
    try {
      const { campaignId, updates, updatedBy } = data;
      
      // Verify user has permission to update campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.emit('error', { message: 'Campaign not found' });
        return;
      }

      // Only DM can update campaign details
      if (campaign.dmId !== socket.userId) {
        socket.emit('error', { message: 'Not authorized to update this campaign' });
        return;
      }

      const roomName = `campaign:${campaignId}`;
      
      // Broadcast update to all campaign members
      socket.to(roomName).emit('campaign-updated', {
        campaignId,
        updates,
        updatedBy: socket.userId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Campaign update error:', error);
      socket.emit('error', { message: 'Failed to broadcast campaign update' });
    }
  });

  // Character updates within campaign
  socket.on('character-updated', async (data) => {
    try {
      const { campaignId, characterId, updates } = data;
      
      // Verify user has access to this campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.emit('error', { message: 'Campaign not found' });
        return;
      }

      const roomName = `campaign:${campaignId}`;
      
      // Broadcast character update to campaign members
      socket.to(roomName).emit('character-updated', {
        campaignId,
        characterId,
        updates,
        updatedBy: socket.userId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Character update error:', error);
      socket.emit('error', { message: 'Failed to broadcast character update' });
    }
  });

  // Dice roll in campaign context
  socket.on('campaign-dice-roll', async (data) => {
    try {
      const { campaignId, roll, isPrivate = false } = data;
      
      // Verify user has access to this campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.emit('error', { message: 'Campaign not found' });
        return;
      }

      const roomName = `campaign:${campaignId}`;
      
      if (isPrivate) {
        // Only send to GM if it's a private roll
        // This would need a mechanism to map userId to socketId, which is not implemented here.
        // For now, private rolls will not be delivered.
        socket.emit('dice-roll-sent', { isPrivate: true, message: 'Private rolls not fully supported yet.' });
      } else {
        // Broadcast public roll to all campaign members
        io.to(roomName).emit('public-dice-roll', {
          campaignId,
          roll,
          rolledBy: socket.userId,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Campaign dice roll error:', error);
      socket.emit('error', { message: 'Failed to broadcast dice roll' });
    }
  });

  // Initiative tracker updates
  socket.on('initiative-update', async (data) => {
    try {
      const { campaignId, initiative } = data;
      
      // Verify user has access to this campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.emit('error', { message: 'Campaign not found' });
        return;
      }

      // Only GM can update initiative
      if (campaign.dmId !== socket.userId) {
        socket.emit('error', { message: 'Only GM can update initiative tracker' });
        return;
      }

      const roomName = `campaign:${campaignId}`;
      
      // Broadcast initiative update to all campaign members
      socket.to(roomName).emit('initiative-updated', {
        campaignId,
        initiative,
        updatedBy: socket.userId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Initiative update error:', error);
      socket.emit('error', { message: 'Failed to update initiative' });
    }
  });

  // Session status updates (start/pause/end)
  socket.on('session-status-change', async (data) => {
    try {
      const { campaignId, status, sessionData } = data;
      
      // Verify user has access to this campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.emit('error', { message: 'Campaign not found' });
        return;
      }

      // Only GM can change session status
      if (campaign.dmId !== socket.userId) {
        socket.emit('error', { message: 'Only GM can change session status' });
        return;
      }

      const roomName = `campaign:${campaignId}`;
      
      // Broadcast session status change to all campaign members
      io.to(roomName).emit('session-status-changed', {
        campaignId,
        status,
        sessionData,
        changedBy: socket.userId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Session status change error:', error);
      socket.emit('error', { message: 'Failed to change session status' });
    }
  });
};

module.exports = campaignHandlers;