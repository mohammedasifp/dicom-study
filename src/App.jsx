import { Suspense, lazy, useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import RadiologistWorklist from './pages/RadiologistWorklist.jsx'
import OperationsDashboard from './pages/OperationsDashboard.jsx'
import StateMessage from './components/common/StateMessage.jsx'
import { useAuth } from './auth/AuthContext.js'
import { ROUTE, navigate, parseHash, paths } from './routes.js'

// The report editor (TipTap) is the heaviest part of the bundle; load it only when a study is opened.
const ReportingScreen = lazy(() => import('./pages/ReportingScreen.jsx'))

function App() {
  const { user, logout } = useAuth()
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // Signed-out users see only the sign-in screen; a deep link opens once they have signed in.
  if (!user) return <LoginPage />

  // The next person to sign in starts on the worklist, not on the previous user's study.
  const onLogout = () => {
    logout()
    navigate(paths.worklist())
  }

  const route = parseHash(hash)
  return <Suspense fallback={<StateMessage variant="loading" sx={{ height: '100%' }} />}>{renderRoute(route, onLogout)}</Suspense>
}

function renderRoute(route, onLogout) {
  if (route.name === ROUTE.STUDY_REPORT) {
    return <ReportingScreen key={route.studyId} uid={route.studyId} onExit={() => navigate(paths.worklist())} />
  }
  const shared = { onOpenStudy: (id) => navigate(paths.studyReport(id)), onHome: () => navigate(paths.worklist()), onNavigate: (section) => navigate(paths[section]()), onLogout }
  if (route.name === ROUTE.OPERATIONS) return <OperationsDashboard {...shared} />
  return <RadiologistWorklist {...shared} />
}

export default App
