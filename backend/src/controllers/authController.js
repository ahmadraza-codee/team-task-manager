
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const db = require('../db');

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await db.findUserByEmail(email)) return res.status(409).json({ error: 'Email already registered' });
  const password_hash = await bcrypt.hash(password, 10); // never store plain text
  const user = await db.createUser({ name, email, password_hash });
  req.login(user, (err) => err ? res.status(500).json({ error: 'Login after register failed' }) : res.status(201).json({ user: db.publicUser(user) }));
};

// POST /api/auth/login — session is regenerated on successful login (fixation protection)
exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    const finish = () => req.login(user, async (e) => {
      if (e) return next(e);
      const reminders = await db.remindersForUser(user.id);
      return res.json({ user: db.publicUser(user), reminders });
    });
    if (req.session && typeof req.session.regenerate === 'function') {
      req.session.regenerate((regenErr) => regenErr ? next(regenErr) : finish());
    } else finish();
  })(req, res, next);
};

// POST /api/auth/logout — destroys the session
exports.logout = (req, res) => req.logout(() => req.session.destroy(() => res.json({ message: 'Logged out' })));

// GET /api/auth/me
exports.me = async (req, res) => res.json({ user: db.publicUser(req.user), reminders: await db.remindersForUser(req.user.id) });
