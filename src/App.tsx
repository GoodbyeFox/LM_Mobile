import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LMStudioProvider } from '@/contexts/LMStudioContext'
import Layout from '@/components/Layout'
import ChatPage from '@/pages/ChatPage'
import ModelsPage from '@/pages/ModelsPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <LMStudioProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </LMStudioProvider>
  )
}
