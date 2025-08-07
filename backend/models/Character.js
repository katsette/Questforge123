const { firestore } = require('firebase-admin');

class Character {
  static async create(characterData) {
    const { 
      name, 
      class: characterClass, 
      level = 1, 
      race = null, 
      background = null, 
      stats = null, 
      userId, 
      campaignId = null 
    } = characterData;
    
    const charactersRef = firestore().collection('characters');
    const newCharacterRef = await charactersRef.add({
      name,
      class: characterClass,
      level,
      race,
      background,
      stats,
      userId,
      campaignId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newCharacter = await newCharacterRef.get();
    return { id: newCharacter.id, ...newCharacter.data() };
  }

  static async findById(id) {
    const characterRef = firestore().collection('characters').doc(id);
    const character = await characterRef.get();
    if (!character.exists) {
      return null;
    }
    return { id: character.id, ...character.data() };
  }

  static async findAll() {
    const charactersRef = firestore().collection('characters');
    const snapshot = await charactersRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByUser(userId) {
    const charactersRef = firestore().collection('characters');
    const snapshot = await charactersRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByCampaign(campaignId) {
    const charactersRef = firestore().collection('characters');
    const snapshot = await charactersRef.where('campaignId', '==', campaignId).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateById(id, updateData) {
    const characterRef = firestore().collection('characters').doc(id);
    await characterRef.update({
      ...updateData,
      updatedAt: new Date(),
    });
    return this.findById(id);
  }

  static async deleteById(id) {
    const characterRef = firestore().collection('characters').doc(id);
    await characterRef.delete();
    return true;
  }

  static async isOwner(characterId, userId) {
    const character = await this.findById(characterId);
    return character && character.userId === userId;
  }

  static async assignToCampaign(characterId, campaignId) {
    return this.updateById(characterId, { campaignId });
  }

  static async removeFromCampaign(characterId) {
    return this.updateById(characterId, { campaignId: null });
  }

  static async levelUp(characterId) {
    const character = await this.findById(characterId);
    if (!character) return null;
    
    return this.updateById(characterId, { level: character.level + 1 });
  }

  static async updateStats(characterId, stats) {
    return this.updateById(characterId, { stats });
  }
}

module.exports = Character;