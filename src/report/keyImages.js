import { roiFraction, sourceLabel, wadoUrl } from './format.js'

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

export async function composeRoiImage(source, rawRoi) {
  const img = await loadImage(wadoUrl(source))
  const roi = roiFraction(rawRoi, img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  if (roi) {
    const w = canvas.width
    const h = canvas.height
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = Math.max(2, Math.round(w / 160))
    ctx.beginPath()
    if (roi.shape === 'ellipse') {
      ctx.ellipse((roi.x + roi.width / 2) * w, (roi.y + roi.height / 2) * h, (roi.width / 2) * w, (roi.height / 2) * h, 0, 0, Math.PI * 2)
    } else {
      ctx.rect(roi.x * w, roi.y * h, roi.width * w, roi.height * h)
    }
    ctx.stroke()
  }
  return canvas.toDataURL('image/jpeg', 0.92)
}

export const suggestionCaption = (suggestion) =>
  `Key image: ${sourceLabel(suggestion.source)}${suggestion.roi ? ' (marked region)' : ''}`

export function keyImageContent(image) {
  return [
    { type: 'image', attrs: { src: image.src, alt: '', width: 300 } },
  ]
}

export function setKeyImageDrag(event, image) {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/html', `<img src="${image.src}" width="300">`)
}

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export async function insertImageFiles(editor, files, pos) {
  const images = [...files].filter((f) => f.type.startsWith('image/'))
  for (const file of images) {
    const src = await readAsDataUrl(file)
    const content = keyImageContent({ src })
    if (typeof pos === 'number') editor.chain().focus().insertContentAt(pos, content).run()
    else editor.chain().focus().insertContent(content).run()
  }
  return images.length
}

export function captureViewport(iframe) {
  const doc = iframe && iframe.contentDocument
  if (!doc) return null
  const canvases = [...doc.querySelectorAll('canvas.cornerstone-canvas')]
  const canvas = canvases.sort((a, b) => b.width * b.height - a.width * a.height)[0]
  if (!canvas) return null
  return canvas.toDataURL('image/jpeg', 0.92)
}
