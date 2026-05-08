const db = require('./configs/db');
const bcrypt = require('bcrypt');

async function resetPasswords() {
  try {
    const hash = await bcrypt.hash('12345678', 10);
    console.log('New hash generated.');
    
    await db.query('UPDATE staff SET password_hash = $1 WHERE id = $2', [hash, 'DOC-001']);
    console.log('DOC-001 reset.');
    
    await db.query('UPDATE staff SET password_hash = $1 WHERE id = $2', [hash, 'NRS-002']);
    console.log('NRS-002 reset.');
    
    await db.query('UPDATE staff SET password_hash = $1 WHERE id = $2', [hash, 'ADM-001']);
    console.log('ADM-001 reset.');
    
    console.log('✅ All test passwords reset to 12345678');
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
  } finally {
    process.exit();
  }
}

resetPasswords();
