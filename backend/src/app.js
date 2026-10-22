
const express = require('express'); const cors = require('cors'); const session = require('express-session'); const passport = require('./config/passport'); const db = require('./db'); const { requireAuth } = require('./middleware/auth');
require('dotenv').config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
// Session store: PostgreSQL via connect-pg-simple when DATABASE_URL is set, otherwise memory store (dev fallback)
let store;
if (process.env.DATABASE_URL) { const PgStore = require('connect-pg-simple')(session); store = new PgStore({ conString: process.env.DATABASE_URL, createTableIfMissing: true }); console.log('[session] Using PostgreSQL session store'); }
else console.log('[session] Using memory session store (dev fallback)');
app.use(session({ store, secret: process.env.SESSION_SECRET || 'dev-secret-change-me', resave:false, saveUninitialized:false, cookie:{ httpOnly:true, sameSite:'lax', secure: process.env.NODE_ENV==='production', maxAge: 1000*60*60*24*7 } }));
app.use(passport.initialize()); app.use(passport.session());
app.get('/api/health', (req,res)=> res.json({ ok:true, service:'team-task-manager', db: process.env.DATABASE_URL?'postgres':'memory' }));
app.use('/api/auth', require('./routes/auth')); // only public routes
app.use('/api/teams', requireAuth, require('./routes/teams')); // protect all non-auth routes
app.use('/api/tasks', requireAuth, require('./routes/tasks'));
app.use((req,res)=> res.status(404).json({ error:'Not found' }));
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({ error:'Internal server error' }); });
module.exports = app;
