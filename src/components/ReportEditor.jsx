import { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { AiText, ReviewerText, scanSuggestions } from '../editor/authorshipMarks.js'
import { insertImageFiles } from '../report/keyImages.js'
import { REVIEW_ACTION_EVENT, ReviewDecorations, reviewKey, suggestionInBlock } from '../editor/reviewDecorations.js'

const PLACEHOLDERS = {
  'clinical history': 'Add the clinical history…',
  technique: 'Describe the technique…',
  findings: 'Describe the findings…',
  impression: 'Write the impression…',
}

function sectionPlaceholder({ editor, node, pos }) {
  if (node.type.name !== 'paragraph') return ''
  let heading = ''
  editor.state.doc.forEach((child, offset) => {
    if (offset < pos && child.type.name === 'heading') heading = child.textContent.trim().toLowerCase()
  })
  return PLACEHOLDERS[heading] || ''
}

const extensions = [
  StarterKit.configure({
    heading: { levels: [3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
  }),
  Image.configure({ allowBase64: true, resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 120 } }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  Placeholder.configure({ placeholder: sectionPlaceholder, showOnlyCurrent: false }),
  AiText,
  ReviewerText,
  ReviewDecorations,
]

export default function ReportEditor({ initialContent, editable, statuses, activeId, hoverId, onReady, onScan, onSuggestionFocus, onReviewAction, onTransaction }) {
  const callbacks = useRef({ onScan, onSuggestionFocus, onReviewAction, onTransaction, editor: null })
  useEffect(() => {
    Object.assign(callbacks.current, { onScan, onSuggestionFocus, onReviewAction, onTransaction })
  })

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    editorProps: {
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !callbacks.current.editor) return false

        // 1. OS file drop (from computer)
        const files = event.dataTransfer && event.dataTransfer.files
        if (files && files.length) {
          const at = view.posAtCoords({ left: event.clientX, top: event.clientY })
          event.preventDefault()
          insertImageFiles(callbacks.current.editor, files, at ? at.pos : undefined)
          return true
        }

        // 2. In-browser DOM/HTML drop (from KeyImageTray, SuggestionRail, OHIF, etc.)
        const html = event.dataTransfer && event.dataTransfer.getData('text/html')
        if (html) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          const img = doc.querySelector('img')
          if (img && img.getAttribute('src')) {
            event.preventDefault()
            const at = view.posAtCoords({ left: event.clientX, top: event.clientY })
            const src = img.getAttribute('src')
            const imageNode = { type: 'image', attrs: { src, width: 300 } }
            if (at && typeof at.pos === 'number') {
              callbacks.current.editor.chain().focus().insertContentAt(at.pos, imageNode).run()
            } else {
              callbacks.current.editor.chain().focus().insertContent(imageNode).run()
            }
            return true
          }
        }

        return false
      },
      handlePaste: (_view, event) => {
        const files = event.clipboardData && event.clipboardData.files
        if (!files || !files.length || !callbacks.current.editor) return false
        insertImageFiles(callbacks.current.editor, files)
        return true
      },
    },
    onUpdate: ({ editor: ed }) => callbacks.current.onScan(scanSuggestions(ed.state.doc)),
    onSelectionUpdate: ({ editor: ed }) => {
      const id = suggestionInBlock(ed.state)
      if (id) callbacks.current.onSuggestionFocus(id)
    },
    onTransaction: () => callbacks.current.onTransaction(),
  })

  useEffect(() => {
    if (!editor) return undefined
    callbacks.current.editor = editor
    onReady(editor)
    const dom = editor.view.dom
    const handle = (e) => callbacks.current.onReviewAction(e.detail.action, e.detail.id)
    dom.addEventListener(REVIEW_ACTION_EVENT, handle)
    return () => dom.removeEventListener(REVIEW_ACTION_EVENT, handle)
  }, [editor, onReady])

  useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable, false)
  }, [editor, editable])

  useEffect(() => {
    if (!editor) return
    editor.view.dispatch(editor.state.tr.setMeta(reviewKey, { statuses, activeId, hoverId }).setMeta('addToHistory', false))
  }, [editor, statuses, activeId, hoverId])

  return <EditorContent editor={editor} />
}
