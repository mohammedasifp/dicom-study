window.config.investigationalUseDialog = { option: 'never' }

window.config.whiteLabeling = {
  createLogoComponentFn: function (React) {
    return React.createElement('span')
  },
}

// Orthanc's DicomWeb "Host": "127.0.0.1" makes bulk-data URIs absolute to port 80, which the browser cannot reach.
window.config.dataSources.forEach(function (source) {
  if (source.configuration && source.configuration.bulkDataURI) source.configuration.bulkDataURI.enabled = false
})

;(function skipOnboardingTour() {
  var shown = JSON.parse(localStorage.getItem('shownTours') || '[]')
  if (shown.indexOf('basicViewerTour') === -1) shown.push('basicViewerTour')
  localStorage.setItem('shownTours', JSON.stringify(shown))
})()

;(function flowHeaderWhenNarrow() {
  var header = '.relative.h-\\[48px\\]'
  var css =
    '@media (max-width: 899px) {' +
    header + ' { display: flex !important; align-items: center; gap: 6px; }' +
    header + ' > .absolute { position: static !important; transform: none !important; }' +
    header + ' > .absolute.left-1\\/2 { flex: 1 1 auto; min-width: 0; overflow-x: auto; scrollbar-width: none; }' +
    header + ' > .absolute.left-1\\/2::-webkit-scrollbar { display: none; }' +
    header + ' > .absolute.left-1\\/2 > div { justify-content: flex-start; }' +
    header + ' > .absolute.right-0 { flex-shrink: 0; margin-left: auto; }' +
    '}'
  var style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
})()

;(function hidePatientWidgetWhenNarrow() {
  var scheduled = false
  function apply() {
    scheduled = false
    var narrow = window.innerWidth < 900
    var labels = document.querySelectorAll('.text-primary.self-center')
    for (var i = 0; i < labels.length; i += 1) {
      if (labels[i].textContent.trim() !== 'Patient') continue
      var widget = labels[i].closest('.cursor-pointer')
      if (widget) widget.style.display = narrow ? 'none' : ''
    }
  }
  new MutationObserver(function () {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(apply)
  }).observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener('resize', apply)
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
