import { Route, Routes } from 'react-router-dom'
import ConsumerApp from './ConsumerApp'
import { AppProvider } from './context/AppContext'
import { ProProvider } from './pro/ProContext'
import ProLayout from './pro/ProLayout'
import ProAccount from './screens/pro/ProAccount'
import ProDashboard from './screens/pro/ProDashboard'
import ProLogin from './screens/pro/ProLogin'
import ProPatientDetail from './screens/pro/ProPatientDetail'

export default function App() {
  return (
    <AppProvider>
      <ProProvider>
        <Routes>
          <Route path="/pro/login" element={<ProLogin />} />
          <Route path="/pro" element={<ProLayout />}>
            <Route index element={<ProDashboard />} />
            <Route path="patients/:id" element={<ProPatientDetail />} />
            <Route path="compte" element={<ProAccount />} />
          </Route>

          <Route path="*" element={<ConsumerApp />} />
        </Routes>
      </ProProvider>
    </AppProvider>
  )
}
