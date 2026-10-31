const KEY = { next: [34, 'PageDown'], previous: [33, 'PageUp'], down: [40, 'ArrowDown'], up: [38, 'ArrowUp'] }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function press(doc, [keyCode, key], times = 1) {
  for (let i = 0; i < times; i++) {
    const event = new doc.defaultView.KeyboardEvent('keydown', { key, bubbles: true })
    // The KeyboardEvent constructor ignores keyCode, and OHIF's hotkey library reads only keyCode/which.
    Object.defineProperty(event, 'keyCode', { get: () => keyCode })
    Object.defineProperty(event, 'which', { get: () => keyCode })
    doc.dispatchEvent(event)
  }
}

function readOverlay(iframe) {
  const doc = iframe && iframe.contentDocument
  const element = doc && doc.querySelector('.viewport-wrapper')
  if (!element) return null
  const lines = element.innerText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  const text = lines.join('|')
  const position = text.match(/\((\d+)\/(\d+)\)/)
  const instance = text.match(/I:\s*(\d+)/)
  return {
    doc,
    lines,
    text,
    index: position ? Number(position[1]) : 1,
    total: position ? Number(position[2]) : 1,
    instance: instance ? Number(instance[1]) : null,
  }
}

// OHIF repaints the overlay piece by piece (orientation, then series name, then counter): read it only once it holds still.
async function settledOverlay(iframe, isCancelled, timeout = 8000) {
  let last = null
  let same = 0
  for (const end = Date.now() + timeout; !isCancelled() && Date.now() < end; await sleep(150)) {
    const overlay = readOverlay(iframe)
    same = overlay && last && overlay.text === last.text ? same + 1 : 0
    if (same >= 3) return overlay
    last = overlay
  }
  return last
}

async function waitForChange(iframe, before, isCancelled) {
  for (const end = Date.now() + 5000; !isCancelled() && Date.now() < end; ) {
    await sleep(150)
    const overlay = readOverlay(iframe)
    if (overlay && overlay.text !== before.text) return true
  }
  return false
}

async function showSeries(iframe, target, studySeries, isCancelled) {
  let direction = null
  let turned = false
  for (let step = 0; step < 80 && !isCancelled(); step++) {
    const overlay = await settledOverlay(iframe, isCancelled, step ? 8000 : 30000)
    if (!overlay) return false
    if (studySeries.length <= 1 || overlay.lines.includes(target.seriesDescription)) return true
    if (!direction) {
      const current = studySeries.find((s) => overlay.lines.includes(s.description))
      direction = current && current.number > target.seriesNumber ? KEY.previous : KEY.next
    }
    press(overlay.doc, direction)
    if (!(await waitForChange(iframe, overlay, isCancelled))) {
      if (turned) return false
      direction = direction === KEY.next ? KEY.previous : KEY.next
      turned = true
    }
  }
  return false
}

async function showImage(iframe, position, isCancelled) {
  for (let step = 0; step < 60 && !isCancelled(); step++) {
    const overlay = await settledOverlay(iframe, isCancelled)
    if (!overlay) return false
    const diff = Math.min(position, overlay.total) - overlay.index
    if (diff === 0) return true
    press(overlay.doc, diff > 0 ? KEY.down : KEY.up, Math.abs(diff))
    await waitForChange(iframe, overlay, isCancelled)
  }
  return false
}

function positionInSeries(target, studySeries) {
  if (target.frame) return target.frame
  const series = studySeries.find((s) => s.number === target.seriesNumber)
  const index = series ? series.instanceNumbers.indexOf(target.instanceNumber) : -1
  return index + 1
}

export function imageRect(iframe, roi) {
  const doc = iframe && iframe.contentDocument
  const wrapper = doc && doc.querySelector('.viewport-wrapper')
  const element = wrapper && wrapper.querySelector('.viewport-element')
  const aspect = roi.imageWidth && roi.imageHeight ? roi.imageWidth / roi.imageHeight : null
  if (!element || !aspect) return null
  const box = element.getBoundingClientRect()
  const width = box.width / box.height > aspect ? box.height * aspect : box.width
  const height = width / aspect
  return { left: box.left + (box.width - width) / 2, top: box.top + (box.height - height) / 2, width, height }
}

export async function navigateViewer(iframe, target, studySeries, isCancelled) {
  if (!(await showSeries(iframe, target, studySeries, isCancelled))) return false
  const position = positionInSeries(target, studySeries)
  if (position > 0) await showImage(iframe, position, isCancelled)
  return true
}
