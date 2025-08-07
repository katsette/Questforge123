const { getDB } = require('../config/database');

class Message {
  static create(messageData) {
    const db = getDB();
    const { 
      content, 
      type = 'text', 
      userId, 
      campaignId, 
      characterId = null, 
      isSystemMessage = false 
    } = messageData;
    
    const stmt = db.prepare(`
      INSERT INTO messages (content, type, userId, campaignId, characterId, isSystemMessage)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(content, type, userId, campaignId, characterId, isSystemMessage ? 1 : 0);
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.firstName, u.lastName, u.avatar,
             ch.name as characterName, c.name as campaignName
      FROM messages m
      JOIN users u ON m.userId = u.id
      JOIN campaigns c ON m.campaignId = c.id
      LEFT JOIN characters ch ON m.characterId = ch.id
      WHERE m.id = ?
    `);
    return stmt.get(id);
  }

  static findByCampaign(campaignId, limit = 50, offset = 0) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.firstName, u.lastName, u.avatar,
             ch.name as characterName
      FROM messages m
      JOIN users u ON m.userId = u.id
      LEFT JOIN characters ch ON m.characterId = ch.id
      WHERE m.campaignId = ?
      ORDER BY m.createdAt DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(campaignId, limit, offset).reverse();
  }

  static getRecentMessages(campaignId, limit = 50) {
    return this.findByCampaign(campaignId, limit, 0);
  }

  static findByUser(userId, limit = 50) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.firstName, u.lastName, u.avatar,
             ch.name as characterName, c.name as campaignName
      FROM messages m
      JOIN users u ON m.userId = u.id
      JOIN campaigns c ON m.campaignId = c.id
      LEFT JOIN characters ch ON m.characterId = ch.id
      WHERE m.userId = ?
      ORDER BY m.createdAt DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
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
    
    values.push(new Date().toISOString()); // updatedAt (not in schema but good practice)
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE messages 
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values.slice(0, -1), id); // Remove updatedAt since it's not in the schema
    return this.findById(id);
  }

  static deleteById(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Delete all messages in a campaign
  static deleteByCampaign(campaignId) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM messages WHERE campaignId = ?');
    const result = stmt.run(campaignId);
    return result.changes;
  }

  // Check if user owns message
  static isOwner(messageId, userId) {
    const db = getDB();
    const stmt = db.prepare('SELECT userId FROM messages WHERE id = ?');
    const message = stmt.get(messageId);
    return message && message.userId === userId;
  }

  // Get message count for campaign
  static getCountByCampaign(campaignId) {
    const db = getDB();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE campaignId = ?');
    const result = stmt.get(campaignId);
    return result.count;
  }

  // Search messages in campaign
  static searchInCampaign(campaignId, searchTerm, limit = 20) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.firstName, u.lastName, u.avatar,
             ch.name as characterName
      FROM messages m
      JOIN users u ON m.userId = u.id
      LEFT JOIN characters ch ON m.characterId = ch.id
      WHERE m.campaignId = ? AND m.content LIKE ?
      ORDER BY m.createdAt DESC
      LIMIT ?
    `);
    return stmt.all(campaignId, `%${searchTerm}%`, limit);
  }

  // Create system message
  static createSystemMessage(campaignId, content) {
    return this.create({
      content,
      type: 'system',
      userId: null, // System messages don't have a user
      campaignId,
      isSystemMessage: true
    });
  }

  // Get messages with pagination
  static getPaginated(campaignId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const messages = this.findByCampaign(campaignId, limit, offset);
    const totalCount = this.getCountByCampaign(campaignId);
    
    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = Message;
