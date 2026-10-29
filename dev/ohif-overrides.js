window.config.investigationalUseDialog = { option: 'never' }

// Orthanc's DicomWeb "Host": "127.0.0.1" makes bulk-data URIs absolute to port 80, which the browser cannot reach.
window.config.dataSources.forEach(function (source) {
  if (source.configuration && source.configuration.bulkDataURI) source.configuration.bulkDataURI.enabled = false
})

;(function skipOnboardingTour() {
  var shown = JSON.parse(localStorage.getItem('shownTours') || '[]')
  if (shown.indexOf('basicViewerTour') === -1) shown.push('basicViewerTour')
  localStorage.setItem('shownTours', JSON.stringify(shown))
})()

;(function collapseStudyListWhenNarrow() {
  if (window.innerWidth >= 1100) return
  var observer = new MutationObserver(function () {
    if (!document.querySelector('[data-cy="studyBrowser-panel"]')) return
    var toggle = document.querySelector('[data-cy="side-panel-header-left"]')
    if (!toggle) return
    observer.disconnect()
    toggle.click()
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  setTimeout(function () {
    observer.disconnect()
  }, 20000)
})()
