const jwt = require('jsonwebtoken');

const ADMIN_USER = {
  username: 'admin@gmail.com',
  password: 'v4run',
  role: 'admin'
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      const token = jwt.sign(
        { username: ADMIN_USER.username, role: ADMIN_USER.role },
        process.env.JWT_SECRET,
        { expiresIn: '5m' } 
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          username: ADMIN_USER.username,
          role: ADMIN_USER.role
        }
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { login };
