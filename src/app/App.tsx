import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import BacklogView from '../features/board/BacklogView';
import SprintBoard from '../features/board/SprintBoard';
import PagesView from '../features/pages/PagesView';
import InboxView from '../features/inbox/InboxView';
import SettingsView from '../features/settings/SettingsView';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/backlog" replace />} />
        <Route path="backlog" element={<BacklogView />} />
        <Route path="board" element={<SprintBoard />} />
        <Route path="pages" element={<PagesView />} />
        <Route path="pages/:pageId" element={<PagesView />} />
        <Route path="inbox" element={<InboxView />} />
        <Route path="inbox/:messageId" element={<InboxView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/backlog" replace />} />
      </Route>
    </Routes>
  );
}
