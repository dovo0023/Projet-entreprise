import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import Header from '../components/Header'

export default function AppLayout() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-cream">
      <Header />
      <Outlet />
      <BottomNav />
    </div>
  )
}
