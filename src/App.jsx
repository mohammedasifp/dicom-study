import { useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import ReportingWorkspace from './pages/ReportingWorkspace.jsx'

const REPORT_HASH = '#/report'

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  if (hash === REPORT_HASH) {
    return <ReportingWorkspace onExit={() => (window.location.hash = '')} />
  }
  return <Landing onStart={() => (window.location.hash = REPORT_HASH)} />
}

export default App
