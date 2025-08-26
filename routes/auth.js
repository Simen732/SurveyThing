const express = require('express');
const argon2 = require('argon2');
const User = require('../models/User');

const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.render('auth/login', { error: 'An error occurred during login' });
  }
});

// Register (for creating admin accounts - remove in production)
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('auth/register', { error: 'Username already exists' });
    }

    const hashedPassword = await argon2.hash(password);
    
    const user = new User({
      username,
      password: hashedPassword,
      isAdmin: isAdmin === 'on'
    });

    await user.save();
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    res.render('auth/register', { error: 'An error occurred during registration' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;