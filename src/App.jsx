import { Suspense, lazy, useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import RadiologistWorklist from './pages/RadiologistWorklist.jsx'
import StateMessage from './components/common/StateMessage.jsx'
import { ROUTE, navigate, parseHash, paths } from './routes.js'

// The report editor (TipTap) is the heaviest part of the bundle; load it only when a study is opened.
const ReportingWorkspace = lazy(() => import('./pages/ReportingWorkspace.jsx'))
const StudyReportPage = lazy(() => import('./pages/StudyReportPage.jsx'))

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
  switch (route.name) {
    case ROUTE.WORKLIST:
      return <RadiologistWorklist onOpenStudy={(id) => navigate(paths.studyReport(id))} onHome={() => navigate(paths.landing())} />
    case ROUTE.STUDY_REPORT:
      return <StudyReportPage studyId={route.studyId} onExit={() => navigate(paths.worklist())} />
    case ROUTE.REPORT:
      return <ReportingWorkspace onExit={() => navigate(paths.landing())} />
    default:
      return <Landing onStart={() => navigate(paths.worklist())} />
  }
}

export default App
