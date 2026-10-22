
const app = require('./app'); const db = require('./db');
const PORT = process.env.PORT || 5000;
(async()=>{ await db.init(); app.listen(PORT, ()=> console.log(`Backend listening on http://localhost:${PORT}`)); })().catch(e=>{ console.error('Failed to start', e); process.exit(1); });
