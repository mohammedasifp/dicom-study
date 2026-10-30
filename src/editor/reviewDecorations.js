import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const reviewKey = new PluginKey('review')
export const REVIEW_ACTION_EVENT = 'review-action'

const emit = (dom, action, id) => dom.dispatchEvent(new CustomEvent(REVIEW_ACTION_EVENT, { detail: { action, id } }))

function buildDecorations(doc, review) {
  const decos = []
  doc.descendants((node, pos) => {
    if (!node.isText) return
    const mark = node.marks.find((m) => m.type.name === 'aiText')
    if (!mark) return
    const id = mark.attrs.suggestionId
    const classes = []
    if (review.statuses[id] === 'pending') classes.push('ai-pending')
    if (id === review.activeId) classes.push('ai-active')
    if (id === review.hoverId) classes.push('ai-hover')
    if (classes.length) decos.push(Decoration.inline(pos, pos + node.nodeSize, { class: classes.join(' ') }))
  })
  return DecorationSet.create(doc, decos)
}

export function suggestionInBlock(state) {
  let id = null
  state.selection.$from.parent.forEach((child) => {
    const mark = !id && child.marks.find((m) => m.type.name === 'aiText')
    if (mark) id = mark.attrs.suggestionId
  })
  return id
}

function suggestionAtCursor(state) {
  const review = reviewKey.getState(state)
  return suggestionInBlock(state) || (review ? review.activeId : null)
}

export const ReviewDecorations = Extension.create({
  name: 'reviewDecorations',

  addKeyboardShortcuts() {
    const fire = (action) => () => {
      emit(this.editor.view.dom, action, suggestionAtCursor(this.editor.state))
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
          init: () => ({ statuses: {}, activeId: null, hoverId: null }),
          apply: (tr, value) => {
            const meta = tr.getMeta(reviewKey)
            return meta ? { ...value, ...meta } : value
          },
        },
        props: {
          decorations: (state) => buildDecorations(state.doc, reviewKey.getState(state)),
        },
      }),
    ]
  },
})
