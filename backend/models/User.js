const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static create(userData) {
    const db = getDB();
    const { username, email, password, firstName = null, lastName = null, avatar = null } = userData;
    
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, firstName, lastName, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(username, email, password, firstName, lastName, avatar);
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static findByEmail(email) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static findByUsername(username) {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  static findAll() {
    const db = getDB();
    const stmt = db.prepare('SELECT id, username, email, firstName, lastName, avatar, createdAt FROM users');
    return stmt.all();
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
      UPDATE users 
      SET ${fields.join(', ')}, updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.findById(id);
  }

  static deleteById(id) {
    const db = getDB();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Get user's campaigns
  static getUserCampaigns(userId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT c.*, u.username as dmUsername
      FROM campaigns c
      JOIN campaign_members cm ON c.id = cm.campaignId
      JOIN users u ON c.dmId = u.id
      WHERE cm.userId = ?
    `);
    return stmt.all(userId);
  }

  // Get user's characters
  static getUserCharacters(userId) {
    const db = getDB();
    const stmt = db.prepare(`
      SELECT ch.*, c.name as campaignName
      FROM characters ch
      LEFT JOIN campaigns c ON ch.campaignId = c.id
      WHERE ch.userId = ?
    `);
    return stmt.all(userId);
  }

  // Convert to JSON (remove sensitive fields)
  static toJSON(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = User;
