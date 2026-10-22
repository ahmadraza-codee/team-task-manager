
import { createContext, useCallback, useContext, useState } from 'react';
import { api } from '../lib/api';
import TaskModal from '../components/TaskModal';
const Ctx = createContext(null);
export const useUI = () => useContext(Ctx);
export function UIProvider({ children }) {
  const [modal, setModal] = useState({ open: false, task: null, presetTeamId: null });
  const [teams, setTeams] = useState([]);
  const openModal = useCallback(async (task = null, presetTeamId = null) => {
    try { const d = await api.teams(); setTeams(d.teams); } catch { setTeams([]); }
    setModal({ open: true, task, presetTeamId });
  }, []);
  const openCreateTask = useCallback((presetTeamId = null) => openModal(null, presetTeamId), [openModal ]);
  const openEditTask = useCallback((task) => openModal(task, null), [openModal]);
  const onSaved = useCallback(() => { window.dispatchEvent(new CustomEvent('tasks-changed')); }, []);
  return <Ctx.Provider value={{ openCreateTask, openEditTask }}>
    {children}
    <TaskModal open={modal.open} task={modal.task} teams={teams} presetTeamId={modal.presetTeamId} onClose={() => setModal({ open: false, task: null, presetTeamId: null })} onSaved={onSaved} />
  </Ctx.Provider>;
}
