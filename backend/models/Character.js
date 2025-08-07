const { getDB } = require('../config/database');

class Character {
  static create(characterData) {
    const db = getDB();
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
    
    const statsJson = stats ? JSON.stringify(stats) : null;
    
    const stmt = db.prepare(`
      INSERT INTO characters (name, class, level, race, background, stats, userId, campaignId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, characterClass, level, race, background, statsJson, userId, campaignId);
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT ch.*, u.username as playerUsername, c.name as campaignName
      FROM characters ch
      JOIN users u ON ch.userId = u.id
      LEFT JOIN campaigns c ON ch.campaignId = c.id
      WHERE ch.id = ?
    `);
    const character = stmt.get(id);
    
    if (character && character.stats) {
      try {
        character.stats = JSON.parse(character.stats);
      } catch (e) {
        character.stats = null;
      }
    }
    
    return character;
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT ch.*, u.username as playerUsername, c.name as campaignName
      FROM characters ch
      JOIN users u ON ch.userId = u.id
      LEFT JOIN campaigns c ON ch.campaignId = c.id
      ORDER BY ch.createdAt DESC
    `);
    const characters = stmt.all();
    
    return characters.map(character => {
      if (character.stats) {
        try {
          character.stats = JSON.parse(character.stats);
        } catch (e) {
          character.stats = null;
        }
      }
      return character;
    });
  }

  static findByUser(userId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT ch.*, u.username as playerUsername, c.name as campaignName
      FROM characters ch
      JOIN users u ON ch.userId = u.id
      LEFT JOIN campaigns c ON ch.campaignId = c.id
      WHERE ch.userId = ?
      ORDER BY ch.createdAt DESC
    `);
    const characters = stmt.all(userId);
    
    return characters.map(character => {
      if (character.stats) {
        try {
          character.stats = JSON.parse(character.stats);
        } catch (e) {
          character.stats = null;
        }
      }
      return character;
    });
  }

  static findByCampaign(campaignId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT ch.*, u.username as playerUsername, c.name as campaignName
      FROM characters ch
      JOIN users u ON ch.userId = u.id
      LEFT JOIN campaigns c ON ch.campaignId = c.id
      WHERE ch.campaignId = ?
      ORDER BY ch.createdAt ASC
    `);
    const characters = stmt.all(campaignId);
    
    return characters.map(character => {
      if (character.stats) {
        try {
          character.stats = JSON.parse(character.stats);
        } catch (e) {
          character.stats = null;
        }
      }
      return character;
    });
  }

  static updateById(id, updateData) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'stats') {
          fields.push(`${key} = ?`);
          values.push(typeof updateData[key] === 'object' ? JSON.stringify(updateData[key]) : updateData[key]);
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(new Date().toISOString()); // updatedAt
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE characters 
      SET ${fields.join(', ')}, updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(id);
  }

  static deleteById(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Check if user owns character
  static isOwner(characterId, userId) {
    const db = getDB();
    const stmt = db.prepare('SELECT userId FROM characters WHERE id = ?');
    const character = stmt.get(characterId);
    return character && character.userId === userId;
  }

  // Assign character to campaign
  static assignToCampaign(characterId, campaignId) {
    return this.updateById(characterId, { campaignId });
  }

  // Remove character from campaign
  static removeFromCampaign(characterId) {
    return this.updateById(characterId, { campaignId: null });
  }

  // Level up character
  static levelUp(characterId) {
    const character = this.findById(characterId);
    if (!character) return null;
    
    return this.updateById(characterId, { level: character.level + 1 });
  }

  // Update character stats
  static updateStats(characterId, stats) {
    return this.updateById(characterId, { stats });
  }
}

module.exports = Character;
