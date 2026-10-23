import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute'

import { Landing } from './pages/Landing'
import { SignIn } from './pages/auth/SignIn'
import { SignUp } from './pages/auth/SignUp'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { Planner } from './pages/Planner'
import { TaskDetail } from './pages/TaskDetail'
import { Tutor } from './pages/Tutor'
import { LearningHistory } from './pages/LearningHistory'
import { Revisions } from './pages/Revisions'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'
import { RecoverAccount } from './pages/RecoverAccount'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/recover-account" element={<RecoverAccount />} />

            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
            <Route path="/planner/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
            <Route path="/tutor" element={<ProtectedRoute><Tutor /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><LearningHistory /></ProtectedRoute>} />
            <Route path="/revisions" element={<ProtectedRoute><Revisions /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
