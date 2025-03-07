require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mariadb = require('mariadb');
const bcrypt = require('bcrypt');
const { RouterOSClient } = require('routeros-client');

const app = express();
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

// Настройка MikroTik
const mikrotik = new RouterOSClient({
    host: process.env.MIKROTIK_HOST,
    user: process.env.MIKROTIK_USER,
    password: process.env.MIKROTIK_PASSWORD,
    port: process.env.MIKROTIK_PORT || 8728
});

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Инициализация БД
const initDB = async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE
            )
        `);
        console.log('База данных инициализирована');
    } catch (err) {
        console.error('Ошибка инициализации БД:', err);
    } finally {
        if (conn) conn.release();
    }
};

// Маршруты
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const [user] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.user = { id: user.id, username: user.username, is_admin: user.is_admin };
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Неверные учетные данные' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/start', async (req, res) => {
    if (!req.session.user) return res.status(401).send();
    try {
        await mikrotik.connect();
        await mikrotik.run(`/ip/firewall/filter/enable numbers=${process.env.MIKROTIK_RULE}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка MikroTik' });
    } finally {
        mikrotik.close();
    }
});

app.post('/api/stop', async (req, res) => {
    if (!req.session.user) return res.status(401).send();
    try {
        await mikrotik.connect();
        await mikrotik.run(`/ip/firewall/filter/disable numbers=${process.env.MIKROTIK_RULE}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка MikroTik' });
    } finally {
        mikrotik.close();
    }
});

// Запуск сервера
initDB().then(() => {
    app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
});