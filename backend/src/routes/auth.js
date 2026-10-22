
const express = require('express'); const bcrypt = require('bcryptjs'); const passport = require('../config/passport'); const db = require('../db');
const { registerValidators, loginValidators, handleValidation } = require('../validators'); const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.post('/register', registerValidators, handleValidation, async (req,res)=>{
  const { name, email, password } = req.body;
  if (await db.findUserByEmail(email)) return res.status(409).json({ error: 'Email already registered' });
  const password_hash = await bcrypt.hash(password, 10); // never store plain text
  const user = await db.createUser({ name, email, password_hash });
  req.login(user, (err)=> err ? res.status(500).json({error:'Login after register failed'}) : res.status(201).json({ user: db.publicUser(user) }));
});
router.post('/login', loginValidators, handleValidation, (req,res,next)=>{
  passport.authenticate('local', (err,user,info)=>{ if(err) return next(err); if(!user) return res.status(401).json({error: info?.message||'Invalid credentials'}); req.login(user, async (e)=>{ if(e) return next(e); const reminders = await db.remindersForUser(user.id); return res.json({ user: db.publicUser(user), reminders }); }); })(req,res,next);
});
router.post('/logout', requireAuth, (req,res)=> req.logout(()=> req.session.destroy(()=> res.json({ message:'Logged out' }))));
router.get('/me', requireAuth, async (req,res)=> res.json({ user: db.publicUser(req.user), reminders: await db.remindersForUser(req.user.id) }));
module.exports = router;
