
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');
const db = require('../db');
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await db.findUserByEmail(email.trim().toLowerCase());
    if (!user) return done(null, false, { message: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password_hash);
    return ok ? done(null, user) : done(null, false, { message: 'Invalid email or password' });
  } catch (e) { return done(e); }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => { try { done(null, await db.findUserById(id)); } catch(e){ done(e); } });
module.exports = passport;
