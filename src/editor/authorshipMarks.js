import { Mark, mergeAttributes } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const PROGRAMMATIC = 'authorship/programmatic'

export const ReviewerText = Mark.create({
  name: 'reviewerText',
  excludes: 'reviewerText aiText',

  parseHTML() {
    return [{ tag: 'span[data-author="reviewer"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-author': 'reviewer', class: 'reviewer-text' }), 0]
  },
})

export const AiText = Mark.create({
  name: 'aiText',
  inclusive: false,
  excludes: 'aiText reviewerText',

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-suggestion-id'),
        renderHTML: (attrs) => ({ 'data-suggestion-id': attrs.suggestionId }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-suggestion-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-author': 'ai', class: 'ai-text' }), 0]
  },

  addProseMirrorPlugins() {
    const aiType = this.type
    return [
      new Plugin({
        key: new PluginKey('authorship'),
        appendTransaction(transactions, _oldState, newState) {
          const reviewerType = newState.schema.marks.reviewerText
          const inserted = []

          transactions.forEach((tr, trIndex) => {
            // 'history$' is prosemirror-history's meta key; undo must keep restored AI marks.
            if (!tr.docChanged || tr.getMeta(PROGRAMMATIC) || tr.getMeta('history$')) return
            tr.steps.forEach((step, stepIndex) => {
              step.getMap().forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                if (newEnd <= newStart) return
                let from = tr.mapping.slice(stepIndex + 1).map(newStart, -1)
                let to = tr.mapping.slice(stepIndex + 1).map(newEnd, 1)
                transactions.slice(trIndex + 1).forEach((later) => {
                  from = later.mapping.map(from, -1)
                  to = later.mapping.map(to, 1)
                })
                if (to > from) inserted.push([from, to])
              })
            })
          })

          if (!inserted.length) return null
          const tr = newState.tr.setMeta(PROGRAMMATIC, true)
          inserted.forEach(([from, to]) => {
            tr.removeMark(from, to, aiType)
            tr.addMark(from, to, reviewerType.create())
          })
          return tr
        },
      }),
    ]
  },
})

export function findSuggestionRanges(doc, suggestionId) {
  const ranges = []
  doc.descendants((node, pos) => {
    if (!node.isText) return
    const mark = node.marks.find((m) => m.type.name === 'aiText' && m.attrs.suggestionId === suggestionId)
    if (!mark) return
    const last = ranges[ranges.length - 1]
    if (last && last.to === pos) last.to = pos + node.nodeSize
    else ranges.push({ from: pos, to: pos + node.nodeSize })
  })
  return ranges
}

export function scanSuggestions(doc) {
  const result = {}
  doc.descendants((node, pos) => {
    if (!node.isText) return
    const mark = node.marks.find((m) => m.type.name === 'aiText')
    if (!mark) return
    const id = mark.attrs.suggestionId
    const entry = result[id] || (result[id] = { text: '', fragments: 0, end: -1 })
    if (entry.end !== pos) entry.fragments += 1
    entry.text += node.text
    entry.end = pos + node.nodeSize
  })
  return result
}

export function removeSuggestion(editor, suggestionId) {
  const { state, view } = editor
  const ranges = findSuggestionRanges(state.doc, suggestionId)
  if (!ranges.length) return
  const tr = state.tr.setMeta(PROGRAMMATIC, true)
  ranges
    .slice()
    .reverse()
    .forEach(({ from, to }) => {
      const start = tr.mapping.map(from)
      tr.delete(start, tr.mapping.map(to))
      const $pos = tr.doc.resolve(start)
      if ($pos.parent.content.size !== 0) return
      let depth = $pos.depth
      while (depth > 1 && $pos.node(depth - 1).childCount === 1) depth -= 1
      if (depth === 1 && tr.doc.childCount === 1) return
      tr.delete($pos.before(depth), $pos.after(depth))
    })
  view.dispatch(tr)
}

export function findSection(doc, title) {
  let start = null
  let end = doc.content.size
  let lastChild = null
  doc.forEach((node, offset) => {
    if (node.type.name === 'heading') {
      if (start !== null && end === doc.content.size) end = offset
      if (node.textContent.trim().toLowerCase() === title.toLowerCase()) start = offset + node.nodeSize
    } else if (start !== null && end === doc.content.size && offset >= start) {
      lastChild = { node, offset }
    }
  })
  return start === null ? null : { start, end, lastChild }
}

export function restoreSuggestion(editor, suggestion, beforeIds, sectionTitle) {
  const { state, view } = editor
  const { schema } = state
  const text = schema.text(suggestion.text, [schema.marks.aiText.create({ suggestionId: suggestion.id })])
  const paragraph = schema.nodes.paragraph.create(null, text)
  const tr = state.tr.setMeta(PROGRAMMATIC, true)

  const anchor = beforeIds.map((id) => findSuggestionRanges(state.doc, id)[0]).find(Boolean)
  const section = findSection(state.doc, sectionTitle)
  if (anchor) {
    const $pos = state.doc.resolve(anchor.from)
    const inList = $pos.depth > 1 && $pos.node($pos.depth - 1).type.name === 'listItem'
    if (inList) tr.insert($pos.before($pos.depth - 1), schema.nodes.listItem.create(null, paragraph))
    else tr.insert($pos.before($pos.depth), paragraph)
  } else if (section && section.lastChild && section.lastChild.node.type.name === 'orderedList') {
    const { node, offset } = section.lastChild
    tr.insert(offset + node.nodeSize - 1, schema.nodes.listItem.create(null, paragraph))
  } else {
    tr.insert(section ? section.end : state.doc.content.size, paragraph)
  }
  view.dispatch(tr)
}

export function revertSuggestion(editor, suggestion) {
  const { state, view } = editor
  const ranges = findSuggestionRanges(state.doc, suggestion.id)
  if (!ranges.length) return
  const $from = state.doc.resolve(ranges[0].from)
  const text = state.schema.text(suggestion.text, [state.schema.marks.aiText.create({ suggestionId: suggestion.id })])
  view.dispatch(state.tr.setMeta(PROGRAMMATIC, true).replaceWith($from.start(), $from.end(), text))
}

export function focusSuggestion(editor, suggestionId) {
  const ranges = findSuggestionRanges(editor.state.doc, suggestionId)
  if (!ranges.length) return false
  editor.chain().focus(undefined, { scrollIntoView: false }).setTextSelection(ranges[0].from).run()
  const dom = editor.view.domAtPos(ranges[0].from).node
  const element = dom.nodeType === 1 ? dom : dom.parentElement
  const block = element && element.closest('p, li')
  const scroller = block && block.closest('.report-scroll')
  if (!block || !scroller) return true
  const box = block.getBoundingClientRect()
  const view = scroller.getBoundingClientRect()
  const comfortable = box.top >= view.top + 60 && box.bottom <= view.bottom - 140
  if (!comfortable) block.scrollIntoView({ block: 'center', behavior: 'smooth' })
  return true
}

const hasMark = (node, name) => node.marks.some((m) => m.type.name === name)

function paragraphRuns(node) {
  const runs = []
  node.forEach((child) => {
    if (!child.isText) return
    const ai = child.marks.find((m) => m.type.name === 'aiText')
    const run = {
      text: child.text,
      author: ai ? 'ai' : hasMark(child, 'reviewerText') ? 'reviewer' : 'source',
      suggestionId: ai ? ai.attrs.suggestionId : null,
      bold: hasMark(child, 'bold'),
      italic: hasMark(child, 'italic'),
      underline: hasMark(child, 'underline'),
    }
    const prev = runs[runs.length - 1]
    const same =
      prev &&
      ['author', 'suggestionId', 'bold', 'italic', 'underline'].every((key) => prev[key] === run[key])
    if (same) prev.text += run.text
    else runs.push(run)
  })
  return runs
}

const imageBlock = (node) => ({ kind: 'image', src: node.attrs.src, alt: node.attrs.alt || '', width: node.attrs.width || null })

function collectBlocks(node, blocks, inList = false) {
  if (node.type.name === 'image') {
    blocks.push(imageBlock(node))
    return
  }
  if (node.type.name === 'paragraph') {
    const runs = paragraphRuns(node)
    if (runs.length) blocks.push({ kind: inList ? 'listItem' : 'paragraph', runs })
    return
  }
  if (node.type.name === 'table') {
    const rows = []
    node.forEach((row) => {
      const cells = []
      row.forEach((cell) => cells.push({ header: cell.type.name === 'tableHeader', text: cell.textContent }))
      rows.push(cells)
    })
    blocks.push({ kind: 'table', rows })
    return
  }
  node.forEach((child) => collectBlocks(child, blocks, inList || node.type.name === 'listItem'))
}

export function extractReport(doc) {
  const sections = []
  let current = { title: '', blocks: [] }
  doc.forEach((node) => {
    if (node.type.name === 'heading') {
      if (current.title || current.blocks.length) sections.push(current)
      current = { title: node.textContent.trim(), blocks: [] }
      return
    }
    collectBlocks(node, current.blocks)
  })
  if (current.title || current.blocks.length) sections.push(current)
  return sections
}
