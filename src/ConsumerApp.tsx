import { Navigate, Route, Routes } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import AppLayout from './layouts/AppLayout'
import Login from './screens/Login'
import Onboarding from './screens/Onboarding'
import Welcome from './screens/Welcome'
import AccueilScreen from './screens/app/AccueilScreen'
import HouseholdScreen from './screens/app/HouseholdScreen'
import PlanningScreen from './screens/app/PlanningScreen'
import ProfileScreen from './screens/app/ProfileScreen'
import ShoppingScreen from './screens/app/ShoppingScreen'
import SubscriptionScreen from './screens/app/SubscriptionScreen'
import TodayScreen from './screens/app/TodayScreen'

export default function ConsumerApp() {
  return (
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
          <Route path="household" element={<HouseholdScreen />} />
          <Route path="home" element={<AccueilScreen />} />
        </Route>

        <Route path="/app/profile" element={<ProfileScreen />} />
        <Route path="/app/subscription" element={<SubscriptionScreen />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  )
}
