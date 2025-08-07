const Database = require('better-sqlite3');
require('dotenv').config();

console.log('Testing database connection...');
console.log('Database path:', process.env.DATABASE_PATH);

try {
  // Create or connect to database
  const db = new Database(process.env.DATABASE_PATH);
  console.log('✅ Database connection successful');
  
  // Test write operation
  db.exec(`CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)`);
  console.log('✅ Table creation successful');
  
  // Test insert
  const stmt = db.prepare(`INSERT INTO test (name) VALUES (?)`);
  const result = stmt.run('test');
  console.log('✅ Insert successful, ID:', result.lastInsertRowid);
  
  // Test select
  const select = db.prepare(`SELECT * FROM test WHERE id = ?`);
  const row = select.get(result.lastInsertRowid);
  console.log('✅ Select successful:', row);
  
  // Cleanup
  db.exec(`DROP TABLE test`);
  console.log('✅ Cleanup successful');
  
  db.close();
  console.log('✅ Database connection closed');
  
} catch (error) {
  console.error('❌ Database test failed:', error);
  process.exit(1);
}
