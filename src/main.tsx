import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import AccountPlaceholderPage from './pages/AccountPlaceholderPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ProtectedRoute from './components/ui/ProtectedRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<App />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <AccountPlaceholderPage title="My Subscriptions" description="Milk plans and recurring deliveries will appear here." />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <AccountPlaceholderPage title="Wallet" description="Wallet balance and transactions will appear here." />
            </ProtectedRoute>
          } />
          <Route path="/coupons" element={
            <ProtectedRoute>
              <AccountPlaceholderPage title="Coupons" description="Available offers and dairy rewards will appear here." />
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute>
              <AccountPlaceholderPage title="Help & Support" description="Support options and help requests will appear here." />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
