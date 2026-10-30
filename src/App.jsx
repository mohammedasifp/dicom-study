import { Suspense, lazy, useEffect, useState } from 'react'
import RadiologistWorklist from './pages/RadiologistWorklist.jsx'
import StateMessage from './components/common/StateMessage.jsx'
import { ROUTE, navigate, parseHash, paths } from './routes.js'

// The report editor (TipTap) is the heaviest part of the bundle; load it only when a study is opened.
const ReportingScreen = lazy(() => import('./pages/ReportingScreen.jsx'))

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const route = parseHash(hash)
  return <Suspense fallback={<StateMessage variant="loading" sx={{ height: '100%' }} />}>{renderRoute(route)}</Suspense>
}

function renderRoute(route) {
  if (route.name === ROUTE.STUDY_REPORT) {
    return <ReportingScreen key={route.studyId} uid={route.studyId} onExit={() => navigate(paths.worklist())} />
  }
  return <RadiologistWorklist onOpenStudy={(id) => navigate(paths.studyReport(id))} onHome={() => navigate(paths.worklist())} />
}

export default App
