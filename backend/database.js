const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'timer_admin',
    password: 'your_db_password_123',
    database: 'timer_db',
    connectionLimit: 5
});

async function initDB() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255),
                is_admin BOOLEAN DEFAULT false,
                require_password_change BOOLEAN DEFAULT true
            )
        `);
        console.log('Таблицы созданы');
    } catch (err) {
        console.error('Ошибка БД:', err);
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { pool, initDB };