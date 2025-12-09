const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

/**
 * Initialize admin user from environment variables
 * Checks if ADMIN_EMAIL and ADMIN_PASSWORD are set in .env
 * Creates admin user in database if not exists
 */
async function initializeAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if environment variables are set
    if (!adminEmail || !adminPassword) {
      console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables');
      return;
    }

    console.log('🔐 Checking admin user initialization...');

    // Check if admin user already exists in database
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND role = "admin"',
      [adminEmail]
    );

    if (existingUsers.length > 0) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    // Default: username = 'Admin', drawing_points = 999999 (unlimited for admin)
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role, drawing_points, creation_count) VALUES (?, ?, ?, "admin", 999999, 0)',
      ['Admin', adminEmail, hashedPassword]
    );

    console.log(`✅ Admin user created successfully: ${adminEmail} (ID: ${result.insertId})`);
    console.log('🔑 Admin credentials loaded from environment variables');

  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error.message);
    throw error;
  }
}

module.exports = {
  initializeAdminUser
};
