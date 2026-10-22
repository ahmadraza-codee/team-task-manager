
// In-memory implementation of the data layer (dev/demo fallback).
const bcrypt = require('bcryptjs');
let seq = { user: 1, team: 1, task: 1, invite: 1 };
const users = [], teams = [], teamMembers = [], tasks = [], invites = [];
const now = () => new Date().toISOString();
const pub = (u) => u && ({ id: u.id, name: u.name, email: u.email, created_at: u.created_at });

async function init() {
  if (users.length) return;
  const hash = await bcrypt.hash('demo1234', 10);
  const demo = { id: seq.user++, name: 'Demo User', email: 'demo@example.com', password_hash: hash, created_at: now() };
  users.push(demo);
  const team = { id: seq.team++, name: 'Demo Team', description: 'Sample team (memory mode)', created_by: demo.id, created_at: now() };
  teams.push(team); teamMembers.push({ team_id: team.id, user_id: demo.id, role: 'owner' });
  tasks.push({ id: seq.task++, title: 'Welcome - try creating a task', description: 'Seeded demo task', status: 'todo', priority: 'high', due_date: new Date().toISOString().slice(0,10), team_id: team.id, assigned_to: demo.id, created_by: demo.id, created_at: now(), updated_at: now() });
}
module.exports = {
  init, isPostgres: false,
  findUserByEmail: async (email) => users.find(u => u.email === email.toLowerCase()) || null,
  findUserById: async (id) => users.find(u => u.id === Number(id)) || null,
  publicUser: pub,
  listUsers: async () => users.map(pub),
  createUser: async ({ name, email, password_hash }) => { const u = { id: seq.user++, name, email: email.toLowerCase(), password_hash, created_at: now() }; users.push(u); return u; },
  createTeam: async ({ name, description, created_by }) => { const t = { id: seq.team++, name, description: description||'', created_by, created_at: now() }; teams.push(t); teamMembers.push({ team_id: t.id, user_id: created_by, role: 'owner' }); return t; },
  listTeamsForUser: async (uid) => teams.filter(t => teamMembers.some(m => m.team_id===t.id && m.user_id===Number(uid))),
  getTeam: async (id) => teams.find(t => t.id===Number(id)) || null,
  updateTeam: async (id, { name, description }) => { const t = await module.exports.getTeam(id); if(t){ t.name=name; t.description=description||''; } return t; },
  deleteTeam: async (id) => { const i = teams.findIndex(t=>t.id===Number(id)); if(i>=0) teams.splice(i,1); for(let j=tasks.length-1;j>=0;j--) if(tasks[j].team_id===Number(id)) tasks.splice(j,1); for(let j=teamMembers.length-1;j>=0;j--) if(teamMembers[j].team_id===Number(id)) teamMembers.splice(j,1); },
  isMember: async (team_id, uid) => teamMembers.some(m=>m.team_id===Number(team_id)&&m.user_id===Number(uid)),
  getMembers: async (team_id) => teamMembers.filter(m=>m.team_id===Number(team_id)).map(m=>{ const u=users.find(x=>x.id===m.user_id); return {...pub(u), role:m.role}; }).filter(x=>x.id),
  addMember: async (team_id, user_id, role='member') => { if(!await module.exports.isMember(team_id,user_id)) teamMembers.push({team_id:Number(team_id),user_id:Number(user_id),role}); return module.exports.getMembers(team_id); },
  removeMember: async (team_id, user_id) => { const i=teamMembers.findIndex(m=>m.team_id===Number(team_id)&&m.user_id===Number(user_id)); if(i>=0) teamMembers.splice(i,1); },
  createInvite: async ({team_id,email,invited_by}) => { const inv={id:seq.invite++,team_id:Number(team_id),email:email.toLowerCase(),invited_by,status:'pending',created_at:now()}; invites.push(inv); console.log('[invite stub] Would email invite to', email, 'for team', team_id); return inv; },
  listInvites: async (team_id) => invites.filter(i=>i.team_id===Number(team_id)),
  createTask: async (data) => { const t={id:seq.task++, ...data, team_id:Number(data.team_id), assigned_to:data.assigned_to?Number(data.assigned_to):null, created_at:now(), updated_at:now()}; tasks.push(t); return t; },
  getTask: async (id) => tasks.find(t=>t.id===Number(id))||null,
  updateTask: async (id, data) => { const t=await module.exports.getTask(id); if(t) Object.assign(t, data, {team_id:Number(data.team_id||t.team_id), assigned_to:data.assigned_to?Number(data.assigned_to):null, updated_at:now()}); return t; },
  deleteTask: async (id) => { const i=tasks.findIndex(t=>t.id===Number(id)); if(i>=0) tasks.splice(i,1); },
  listTasks: async (uid, {teamId, assignee, status, search}={}) => {
    let out = tasks.filter(t=>teamMembers.some(m=>m.team_id===t.team_id&&m.user_id===Number(uid)));
    if(teamId) out=out.filter(t=>t.team_id===Number(teamId));
    if(assignee) out=out.filter(t=>t.assigned_to===Number(assignee));
    if(status) out=out.filter(t=>t.status===status);
    if(search) { const q=search.toLowerCase(); out=out.filter(t=>(t.title+' '+(t.description||'')).toLowerCase().includes(q)); }
    return out.sort((a,b)=>a.id-b.id);
  },
  remindersForUser: async (uid) => {
    const today = new Date().toISOString().slice(0,10);
    const mine = tasks.filter(t=>t.assigned_to===Number(uid) && t.status!=='done' && t.due_date);
    return { overdue: mine.filter(t=>t.due_date < today), due_today: mine.filter(t=>t.due_date===today) };
  },
};
