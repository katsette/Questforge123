const { firestore } = require('firebase-admin');

class Message {
  static async create(messageData) {
    const { 
      content, 
      type = 'text', 
      userId, 
      campaignId, 
      characterId = null, 
      isSystemMessage = false 
    } = messageData;
    
    const messagesRef = firestore().collection('campaigns').doc(campaignId).collection('messages');
    const newMessageRef = await messagesRef.add({
      content,
      type,
      userId,
      campaignId,
      characterId,
      isSystemMessage,
      createdAt: new Date(),
    });

    const newMessage = await newMessageRef.get();
    return { id: newMessage.id, ...newMessage.data() };
  }

  static async findById(id, campaignId) {
    const messageRef = firestore().collection('campaigns').doc(campaignId).collection('messages').doc(id);
    const message = await messageRef.get();
    if (!message.exists) {
      return null;
    }
    return { id: message.id, ...message.data() };
  }

  static async findByCampaign(campaignId, limit = 50, offset = 0) {
    const messagesRef = firestore().collection('campaigns').doc(campaignId).collection('messages');
    const snapshot = await messagesRef.orderBy('createdAt', 'desc').limit(limit).offset(offset).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  }

  static async getRecentMessages(campaignId, limit = 50) {
    return this.findByCampaign(campaignId, limit, 0);
  }

  static async findByUser(userId, limit = 50) {
    const messagesRef = firestore().collectionGroup('messages');
    const snapshot = await messagesRef.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limit).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateById(id, campaignId, updateData) {
    const messageRef = firestore().collection('campaigns').doc(campaignId).collection('messages').doc(id);
    await messageRef.update(updateData);
    return this.findById(id, campaignId);
  }

  static async deleteById(id, campaignId) {
    const messageRef = firestore().collection('campaigns').doc(campaignId).collection('messages').doc(id);
    await messageRef.delete();
    return true;
  }

  static async deleteByCampaign(campaignId) {
    const messagesRef = firestore().collection('campaigns').doc(campaignId).collection('messages');
    const snapshot = await messagesRef.get();
    const batch = firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return snapshot.size;
  }

  static async isOwner(messageId, campaignId, userId) {
    const message = await this.findById(messageId, campaignId);
    return message && message.userId === userId;
  }

  static async getCountByCampaign(campaignId) {
    const messagesRef = firestore().collection('campaigns').doc(campaignId).collection('messages');
    const snapshot = await messagesRef.get();
    return snapshot.size;
  }

  static async searchInCampaign(campaignId, searchTerm, limit = 20) {
    const messagesRef = firestore().collection('campaigns').doc(campaignId).collection('messages');
    const snapshot = await messagesRef
      .where('content', '>=', searchTerm)
      .where('content', '<=', searchTerm + '\uf8ff')
      .orderBy('content')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createSystemMessage(campaignId, content) {
    return this.create({
      content,
      type: 'system',
      userId: null,
      campaignId,
      isSystemMessage: true,
    });
  }

  static async getPaginated(campaignId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const messages = await this.findByCampaign(campaignId, limit, offset);
    const totalCount = await this.getCountByCampaign(campaignId);
    
    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }
}

module.exports = Message;