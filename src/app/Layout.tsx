import { NavLink, Outlet } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useUi } from './uiStore';
import IssueDrawer from '../features/board/IssueDrawer';
import CreateIssueModal from '../features/board/CreateIssueModal';
import AssistantPanel from '../features/assistant/AssistantPanel';

const NAV = [
  { to: '/backlog', label: 'Backlog', icon: '☰' },
  { to: '/board', label: 'Sprint board', icon: '▦' },
  { to: '/pages', label: 'Pages', icon: '▤' },
  { to: '/inbox', label: 'Inbox', icon: '✉' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Layout() {
  const { assistantOpen, toggleAssistant, openCreate } = useUi();
  const unread = useLiveQuery(() => db.inbox.filter((m) => !m.read).count(), [], 0);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-ink-300/60 px-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded bg-brand-500 text-xs font-bold text-white">PO</span>
          <span className="font-semibold">PO Practice Lab</span>
          <span className="text-sm text-ink-500">· HB Retail Group · Central Digital</span>
        </div>
        <button className="btn-primary ml-2" onClick={() => openCreate()}>+ Create</button>
        <div className="ml-auto">
          <button className={`btn ${assistantOpen ? 'bg-brand-50 text-brand-700' : 'btn-subtle'}`} onClick={toggleAssistant}>
            ✦ Coach
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="w-52 shrink-0 border-r border-ink-300/60 bg-ink-100/60 p-2">
          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase text-ink-500">Digital team</p>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded px-2 py-1.5 text-sm ${isActive ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink-700 hover:bg-ink-100'}`
              }
            >
              <span className="w-4 text-center">{n.icon}</span>
              {n.label}
              {n.to === '/inbox' && unread > 0 && (
                <span className="ml-auto rounded-full bg-brand-500 px-1.5 text-xs text-white">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>
        {assistantOpen && <AssistantPanel />}
      </div>
      <IssueDrawer />
      <CreateIssueModal />
    </div>
  );
}
