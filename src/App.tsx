import { Navigate, Route, Routes } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import { AppProvider } from './context/AppContext'
import AppLayout from './layouts/AppLayout'
import Login from './screens/Login'
import Onboarding from './screens/Onboarding'
import Welcome from './screens/Welcome'
import PlanningScreen from './screens/app/PlanningScreen'
import ProfileScreen from './screens/app/ProfileScreen'
import ProgressScreen from './screens/app/ProgressScreen'
import ShoppingScreen from './screens/app/ShoppingScreen'
import SubscriptionScreen from './screens/app/SubscriptionScreen'
import TodayScreen from './screens/app/TodayScreen'

export default function App() {
  return (
    <AppProvider>
      <PhoneShell>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="today" replace />} />
            <Route path="planning" element={<PlanningScreen />} />
            <Route path="today" element={<TodayScreen />} />
            <Route path="shopping" element={<ShoppingScreen />} />
            <Route path="progress" element={<ProgressScreen />} />
          </Route>

          <Route path="/app/profile" element={<ProfileScreen />} />
          <Route path="/app/subscription" element={<SubscriptionScreen />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneShell>
    </AppProvider>
  )
}
