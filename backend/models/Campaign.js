const { getDB } = require('../config/database');

class Campaign {
  static create(campaignData) {
    const db = getDB();
    const { name, description = null, dmId, isActive = true } = campaignData;
    
    const stmt = db.prepare(`
      INSERT INTO campaigns (name, description, dmId, isActive)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, description, dmId, isActive ? 1 : 0);
    
    // Add GM to campaign members
    this.addMember(result.lastInsertRowid, dmId, 'dm');
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT c.*, u.username as dmUsername
      FROM campaigns c
      JOIN users u ON c.dmId = u.id
      WHERE c.id = ?
    `);
    return stmt.get(id);
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT c.*, u.username as dmUsername
      FROM campaigns c
      JOIN users u ON c.dmId = u.id
      ORDER BY c.createdAt DESC
    `);
    return stmt.all();
  }

  static findByGM(dmId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT c.*, u.username as dmUsername
      FROM campaigns c
      JOIN users u ON c.dmId = u.id
      WHERE c.dmId = ?
      ORDER BY c.createdAt DESC
    `);
    return stmt.all(dmId);
  }

  static updateById(id, updateData) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(new Date().toISOString()); // updatedAt
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE campaigns 
      SET ${fields.join(', ')}, updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(id);
  }

  static deleteById(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Campaign members management
  static addMember(campaignId, userId, role = 'player') {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO campaign_members (campaignId, userId, role)
      VALUES (?, ?, ?)
    `);
    return stmt.run(campaignId, userId, role);
  }

  static removeMember(campaignId, userId) {
    const db = getDB();
    const stmt = db.prepare(`
      DELETE FROM campaign_members 
      WHERE campaignId = ? AND userId = ?
    `);
    const result = stmt.run(campaignId, userId);
    return result.changes > 0;
  }

  static getMembers(campaignId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.email, u.firstName, u.lastName, u.avatar, 
             cm.role, cm.joinedAt
      FROM campaign_members cm
      JOIN users u ON cm.userId = u.id
      WHERE cm.campaignId = ?
      ORDER BY cm.role DESC, cm.joinedAt ASC
    `);
    return stmt.all(campaignId);
  }

  static isMember(campaignId, userId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT 1 FROM campaign_members 
      WHERE campaignId = ? AND userId = ?
    `);
    return !!stmt.get(campaignId, userId);
  }

  static getMemberRole(campaignId, userId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT role FROM campaign_members 
      WHERE campaignId = ? AND userId = ?
    `);
    const result = stmt.get(campaignId, userId);
    return result ? result.role : null;
  }

  // Get campaign characters
  static getCharacters(campaignId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT ch.*, u.username as playerUsername
      FROM characters ch
      JOIN users u ON ch.userId = u.id
      WHERE ch.campaignId = ?
      ORDER BY ch.createdAt ASC
    `);
    return stmt.all(campaignId);
  }

  // Get recent messages
  static getRecentMessages(campaignId, limit = 50) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT m.*, u.username, ch.name as characterName
      FROM messages m
      JOIN users u ON m.userId = u.id
      LEFT JOIN characters ch ON m.characterId = ch.id
      WHERE m.campaignId = ?
      ORDER BY m.createdAt DESC
      LIMIT ?
    `);
    return stmt.all(campaignId, limit).reverse();
  }
}

module.exports = Campaign;
