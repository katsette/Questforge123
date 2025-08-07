const { firestore } = require('firebase-admin');

class Campaign {
  static async create(campaignData) {
    const { name, description = null, dmId, isActive = true } = campaignData;
    const campaignsRef = firestore().collection('campaigns');
    const newCampaignRef = await campaignsRef.add({
      name,
      description,
      dmId,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.addMember(newCampaignRef.id, dmId, 'dm');

    const newCampaign = await newCampaignRef.get();
    return { id: newCampaign.id, ...newCampaign.data() };
  }

  static async findById(id) {
    const campaignRef = firestore().collection('campaigns').doc(id);
    const campaign = await campaignRef.get();
    if (!campaign.exists) {
      return null;
    }
    return { id: campaign.id, ...campaign.data() };
  }

  static async findAll() {
    const campaignsRef = firestore().collection('campaigns');
    const snapshot = await campaignsRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByGM(dmId) {
    const campaignsRef = firestore().collection('campaigns');
    const snapshot = await campaignsRef.where('dmId', '==', dmId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateById(id, updateData) {
    const campaignRef = firestore().collection('campaigns').doc(id);
    await campaignRef.update({
      ...updateData,
      updatedAt: new Date(),
    });
    return this.findById(id);
  }

  static async deleteById(id) {
    const campaignRef = firestore().collection('campaigns').doc(id);
    await campaignRef.delete();
    return true;
  }

  static async addMember(campaignId, userId, role = 'player') {
    const membersRef = firestore().collection('campaigns').doc(campaignId).collection('members').doc(userId);
    await membersRef.set({ role, joinedAt: new Date() });
  }

  static async removeMember(campaignId, userId) {
    const memberRef = firestore().collection('campaigns').doc(campaignId).collection('members').doc(userId);
    await memberRef.delete();
    return true;
  }

  static async getMembers(campaignId) {
    const membersRef = firestore().collection('campaigns').doc(campaignId).collection('members');
    const snapshot = await membersRef.orderBy('role', 'desc').orderBy('joinedAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async isMember(campaignId, userId) {
    const memberRef = firestore().collection('campaigns').doc(campaignId).collection('members').doc(userId);
    const member = await memberRef.get();
    return member.exists;
  }

  static async getMemberRole(campaignId, userId) {
    const memberRef = firestore().collection('campaigns').doc(campaignId).collection('members').doc(userId);
    const member = await memberRef.get();
    return member.exists ? member.data().role : null;
  }

  static async getCharacters(campaignId) {
    const charactersRef = firestore().collection('characters');
    const snapshot = await charactersRef.where('campaignId', '==', campaignId).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getRecentMessages(campaignId, limit = 50) {
    const messagesRef = firestore().collection('campaigns').doc(campaignId).collection('messages');
    const snapshot = await messagesRef.orderBy('createdAt', 'desc').limit(limit).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  }
}

module.exports = Campaign;