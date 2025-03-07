module.exports = function(app, pool, bcrypt) {
    // Логин
    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;
        const [user] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.user = {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin,
                require_password_change: user.require_password_change
            };
            res.json({ 
                success: true, 
                require_password_change: user.require_password_change 
            });
        } else {
            res.status(401).json({ error: 'Неверный логин или пароль' });
        }
    });

    // Смена пароля
    app.post('/api/change-password', async (req, res) => {
        if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
        
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = ?, require_password_change = false WHERE id = ?',
            [hashedPassword, req.session.user.id]
        );
        res.json({ success: true });
    });

    // Админ-маршруты
    app.get('/api/admin/users', async (req, res) => {
        if (!req.session.user?.is_admin) return res.status(403).send('Forbidden');
        const users = await pool.query('SELECT id, username, is_admin FROM users');
        res.json(users);
    });
};