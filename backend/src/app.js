
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const { requireAuth } = require('./middleware/auth');
require('dotenv').config();
const app = express();
app.set('trust proxy', 1); // Hosting proxies (Render/GCP) terminate TLS; without this Express sees requests as insecure and refuses to set Secure session cookies
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true })); // CORS restricted to the frontend origin
app.use(express.json());
// Session store: PostgreSQL via connect-pg-simple when DATABASE_URL is set, otherwise memory store (dev fallback)
let store;
if (process.env.DATABASE_URL) { const PgSession = require('connect-pg-simple')(session); const db = require('./db'); store = new PgSession({ pool: db.pool, createTableIfMissing: true }); console.log('[session] Using PostgreSQL session store'); }
else console.log('[session] Using memory session store (dev fallback)');
app.use(session({ store, secret: process.env.SESSION_SECRET || 'dev-secret-change-me', resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: process.env.COOKIE_SAMESITE || 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 } }));
app.use(passport.initialize()); app.use(passport.session());
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'team-task-manager', db: process.env.DATABASE_URL ? 'postgres' : 'memory' }));
// Basic rate limiting on auth endpoints (100 requests / 15 min per IP) - brute-force protection without breaking normal use
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, please try again later' } });
app.use('/api/auth', authLimiter, require('./routes/auth')); // only public routes (register/login; me/logout still check auth inside)
app.use('/api/teams', requireAuth, require('./routes/teams')); // protect all non-auth routes
app.use('/api/tasks', requireAuth, require('./routes/tasks'));
app.use('/api/dashboard', requireAuth, require('./routes/dashboard'));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });
module.exports = app;
