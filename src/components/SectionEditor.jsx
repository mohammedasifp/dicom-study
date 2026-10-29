import { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AiText, ReviewerText, scanSuggestions } from '../editor/authorshipMarks.js'
import { REVIEW_ACTION_EVENT, ReviewDecorations, reviewKey } from '../editor/reviewDecorations.js'

const extensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
  }),
  AiText,
  ReviewerText,
  ReviewDecorations,
]

export default function SectionEditor({
  section,
  initialContent,
  suggestionInfo,
  editable,
  statuses,
  activeId,
  showingId,
  onReady,
  onFocus,
  onScan,
  onSuggestionFocus,
  onReviewAction,
}) {
  const callbacks = useRef({ onScan, onSuggestionFocus, onFocus, onReviewAction })
  useEffect(() => {
    callbacks.current = { onScan, onSuggestionFocus, onFocus, onReviewAction }
  })

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    onUpdate: ({ editor: ed }) => callbacks.current.onScan(section, scanSuggestions(ed.state.doc)),
    onSelectionUpdate: ({ editor: ed }) => {
      const mark = ed.state.selection.$from.marks().find((m) => m.type.name === 'aiText')
      if (mark) callbacks.current.onSuggestionFocus(mark.attrs.suggestionId)
    },
    onFocus: ({ editor: ed }) => callbacks.current.onFocus(section, ed),
    onBlur: () => callbacks.current.onFocus(null, null),
  })

  useEffect(() => {
    if (!editor) return undefined
    onReady(section, editor)
    const dom = editor.view.dom
    const handle = (e) => callbacks.current.onReviewAction(e.detail.action, e.detail.id)
    dom.addEventListener(REVIEW_ACTION_EVENT, handle)
    return () => dom.removeEventListener(REVIEW_ACTION_EVENT, handle)
  }, [editor, onReady, section])

  useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable, false)
  }, [editor, editable])

  useEffect(() => {
    if (!editor) return
    const meta = { info: suggestionInfo, statuses, activeId, showingId, readOnly: !editable }
    editor.view.dispatch(editor.state.tr.setMeta(reviewKey, meta).setMeta('addToHistory', false))
  }, [editor, suggestionInfo, statuses, activeId, showingId, editable])

  return <EditorContent editor={editor} />
}
