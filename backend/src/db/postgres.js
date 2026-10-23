
// PostgreSQL implementation (used on GCP Cloud SQL). Same interface as memory.js.
const { Pool, types } = require('pg');
// Return timestamps as ISO strings instead of Date objects, so date logic like due_date.slice(0,10) behaves the same as the JSON the API sends
types.setTypeParser(1114, (v) => new Date(v).toISOString());
types.setTypeParser(1184, (v) => new Date(v).toISOString());
const fs = require('fs'); const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSLMODE==='require' ? { rejectUnauthorized:false } : undefined });
const pub = (u) => u && ({ id: u.id, name: u.name, email: u.email, created_at: u.created_at });
async function init(){
  const sql = fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8');
  // session table is handled by connect-pg-simple; running the rest is idempotent
  await pool.query(sql.replace(/-- Session table[\s\S]*$/,''));
}
const q = async (text, params) => (await pool.query(text, params)).rows;
const one = async (text, params) => (await q(text, params))[0] || null;
module.exports = {
  init, isPostgres:true, pool, publicUser: pub,
  findUserByEmail: (email)=>one('SELECT * FROM users WHERE email=$1',[email.toLowerCase()]),
  findUserById: (id)=>one('SELECT * FROM users WHERE id=$1',[id]),
  listUsers: async()=> (await q('SELECT id,name,email,created_at FROM users ORDER BY name')).map(pub),
  createUser: ({name,email,password_hash})=>one('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING *',[name,email.toLowerCase(),password_hash]),
  createTeam: async ({name,description,created_by})=>{ const t=await one('INSERT INTO teams(name,description,created_by) VALUES($1,$2,$3) RETURNING *',[name,description||'',created_by]); await pool.query('INSERT INTO team_members(team_id,user_id,role) VALUES($1,$2,$3)',[t.id,created_by,'owner']); return t; },
  listTeamsForUser: (uid)=>q('SELECT t.* FROM teams t JOIN team_members m ON m.team_id=t.id WHERE m.user_id=$1 ORDER BY t.id',[uid]),
  getTeam: (id)=>one('SELECT * FROM teams WHERE id=$1',[id]),
  updateTeam: (id,{name,description})=>one('UPDATE teams SET name=$1,description=$2 WHERE id=$3 RETURNING *',[name,description||'',id]),
  deleteTeam: async(id)=>{ await pool.query('DELETE FROM teams WHERE id=$1',[id]); },
  isMember: async(team_id,uid)=> Boolean(await one('SELECT 1 FROM team_members WHERE team_id=$1 AND user_id=$2',[team_id,uid])),
  getMembers: (team_id)=>q('SELECT u.id,u.name,u.email,m.role FROM team_members m JOIN users u ON u.id=m.user_id WHERE m.team_id=$1 ORDER BY u.name',[team_id]),
  addMember: async(team_id,user_id,role='member')=>{ await pool.query('INSERT INTO team_members(team_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[team_id,user_id,role]); return module.exports.getMembers(team_id); },
  removeMember: async(team_id,user_id)=>{ await pool.query('DELETE FROM team_members WHERE team_id=$1 AND user_id=$2',[team_id,user_id]); },
  createInvite: async({team_id,email,invited_by})=>{ console.log('[invite stub] Would email invite to',email,'for team',team_id); return one('INSERT INTO invites(team_id,email,invited_by) VALUES($1,$2,$3) RETURNING *',[team_id,email.toLowerCase(),invited_by]); },
  listInvites: (team_id)=>q('SELECT * FROM invites WHERE team_id=$1 ORDER BY id DESC',[team_id]),
  createTask: (d)=>one('INSERT INTO tasks(title,description,status,priority,due_date,team_id,assigned_to,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[d.title,d.description||'',d.status||'todo',d.priority||'medium',d.due_date||null,d.team_id,d.assigned_to||null,d.created_by]),
  getTask: (id)=>one('SELECT * FROM tasks WHERE id=$1',[id]),
  updateTask: (id,d)=>one('UPDATE tasks SET title=$1,description=$2,status=$3,priority=$4,due_date=$5,team_id=$6,assigned_to=$7,updated_at=NOW() WHERE id=$8 RETURNING *',[d.title,d.description||'',d.status,d.priority,d.due_date||null,d.team_id,d.assigned_to||null,id]),
  deleteTask: async(id)=>{ await pool.query('DELETE FROM tasks WHERE id=$1',[id]); },
  listTasks: (uid,{teamId,assignee,assigneeId,status,priority,search}={})=>{ assignee = assignee||assigneeId;
    const cond=['m.user_id=$1']; const vals=[uid]; let i=2;
    if(teamId){cond.push(`t.team_id=$${i++}`); vals.push(teamId);} if(assignee){cond.push(`t.assigned_to=$${i++}`); vals.push(assignee);} if(status){cond.push(`t.status=$${i++}`); vals.push(status);} if(priority){cond.push(`t.priority=$${i++}`); vals.push(priority);} if(search){cond.push(`(t.title ILIKE $${i} OR t.description ILIKE $${i})`); vals.push(`%${search}%`); i++;}
    return q(`SELECT t.* FROM tasks t JOIN team_members m ON m.team_id=t.team_id WHERE ${cond.join(' AND ')} ORDER BY t.id`, vals);
  },
  remindersForUser: async(uid)=>{ const today=new Date().toISOString().slice(0,10); const rows=await q("SELECT * FROM tasks WHERE assigned_to=$1 AND status<>'done' AND due_date IS NOT NULL AND due_date <= $2 ORDER BY due_date",[uid,today]); return { overdue: rows.filter(t=>String(t.due_date).slice(0,10)<today), due_today: rows.filter(t=>String(t.due_date).slice(0,10)===today) }; },
};
