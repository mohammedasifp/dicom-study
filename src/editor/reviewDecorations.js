import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const reviewKey = new PluginKey('review')
export const REVIEW_ACTION_EVENT = 'review-action'

const emit = (dom, action, id) => dom.dispatchEvent(new CustomEvent(REVIEW_ACTION_EVENT, { detail: { action, id } }))

const ICON = {
  check:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9.55 17.6 4.4 12.45l1.4-1.4 3.75 3.75 8.65-8.65 1.4 1.4z"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="m6.4 19-1.4-1.4 5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6z"/></svg>',
  image:
    '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zm1-2h12l-3.75-5-3 4L9 13zm-1 2V5z"/></svg>',
  warn: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M1 21 12 2l11 19zm11-3q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m-1-3h2v-5h-2z"/></svg>',
}

const STATUS_TAG = { pending: null, accepted: 'Accepted', edited: 'Edited' }

function el(tag, attrs, html) {
  const node = document.createElement(tag)
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v))
  if (html) node.innerHTML = html
  return node
}

function gutterWidget(info, status) {
  const node = el('span', {
    class: `sg-gutter sg-gutter-${status}`,
    contenteditable: 'false',
    'data-sg-action': 'select',
    'data-sid': info.id,
  })
  const conf = Math.round(info.confidence * 100)
  const tone = conf >= 80 ? 'hi' : conf >= 65 ? 'mid' : 'lo'
  node.innerHTML =
    `<span class="sg-num">${info.index}</span>` +
    `<span class="sg-conf sg-conf-${tone}" title="Model confidence">${conf}%</span>` +
    (info.limitation ? `<span class="sg-warn" title="${info.limitation.replace(/"/g, '&quot;')}">${ICON.warn}</span>` : '')
  if (STATUS_TAG[status]) node.title = STATUS_TAG[status]
  return node
}

function trailingWidget(info, pending, showing) {
  const id = info.id
  const src = info.source
  const sourceLink = src
    ? `<button type="button" class="sg-src${showing ? ' sg-src-showing' : ''}" data-sg-action="source" data-sid="${id}" title="Show this image in the viewer">${ICON.image}<span>S${src.seriesNumber} · ${src.seriesDescription} · Img ${src.instanceNumber}</span>${info.roi ? '<em>ROI</em>' : ''}</button>`
    : ''
  const actions = pending
    ? `<button type="button" class="sg-btn sg-accept" data-sg-action="accept" data-sid="${id}" title="Accept (Alt+Enter)">${ICON.check}<span>Accept</span></button>` +
      `<button type="button" class="sg-btn sg-discard" data-sg-action="discard" data-sid="${id}" title="Discard (Alt+Backspace)">${ICON.close}<span>Discard</span></button>`
    : ''
  return el('span', { class: 'sg-trail', contenteditable: 'false' }, sourceLink + actions)
}

function buildDecorations(doc, review) {
  const info = review.info
  const decos = []
  doc.descendants((node, pos) => {
    if (node.type.name !== 'paragraph') return true
    const ends = {}
    const ids = []
    let hasReviewer = false
    node.forEach((child, offset) => {
      const ai = child.marks.find((m) => m.type.name === 'aiText')
      if (ai) {
        const id = ai.attrs.suggestionId
        if (!ids.includes(id)) ids.push(id)
        ends[id] = pos + 1 + offset + child.nodeSize
      } else if (child.isText && child.text.trim()) {
        hasReviewer = true
      }
    })

    if (!ids.length) {
      if (hasReviewer) decos.push(Decoration.node(pos, pos + node.nodeSize, { class: 'blk blk-reviewer' }))
      return false
    }

    const primary = ids[0]
    const status = review.statuses[primary] || 'pending'
    const classes = ['blk', `blk-${status}`]
    if (ids.includes(review.activeId)) classes.push('blk-active')
    decos.push(Decoration.node(pos, pos + node.nodeSize, { class: classes.join(' ') }))

    if (info[primary]) {
      decos.push(
        Decoration.widget(pos + 1, () => gutterWidget(info[primary], status), {
          side: -1,
          ignoreSelection: true,
          key: `g:${primary}:${status}`,
        }),
      )
    }
    ids.forEach((id) => {
      if (!info[id]) return
      const pending = !review.readOnly && review.statuses[id] === 'pending'
      const showing = review.showingId === id
      if (!pending && !info[id].source) return
      decos.push(
        Decoration.widget(ends[id], () => trailingWidget(info[id], pending, showing), {
          side: 1,
          ignoreSelection: true,
          key: `t:${id}:${pending}:${showing}`,
        }),
      )
    })
    return false
  })
  return DecorationSet.create(doc, decos)
}

function suggestionAtCursor(state) {
  const mark = state.selection.$from.marks().find((m) => m.type.name === 'aiText')
  if (mark) return mark.attrs.suggestionId
  const review = reviewKey.getState(state)
  return review ? review.activeId : null
}

export const ReviewDecorations = Extension.create({
  name: 'reviewDecorations',

  addKeyboardShortcuts() {
    const fire = (action) => () => {
      emit(this.editor.view.dom, `kb:${action}`, suggestionAtCursor(this.editor.state))
      return true
    }
    return {
      'Alt-Enter': fire('accept'),
      'Alt-Backspace': fire('discard'),
      'Alt-ArrowDown': fire('next'),
      'Alt-ArrowUp': fire('prev'),
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: reviewKey,
        state: {
          init: () => ({ info: {}, statuses: {}, activeId: null, showingId: null, readOnly: false }),
          apply: (tr, value) => {
            const meta = tr.getMeta(reviewKey)
            return meta ? { ...value, ...meta } : value
          },
        },
        props: {
          decorations: (state) => buildDecorations(state.doc, reviewKey.getState(state)),
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target.closest && event.target.closest('[data-sg-action]')
              if (!target) return false
              event.preventDefault()
              emit(view.dom, target.getAttribute('data-sg-action'), target.getAttribute('data-sid'))
              return true
            },
          },
        },
      }),
    ]
  },
})
