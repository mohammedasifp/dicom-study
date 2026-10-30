import { useCallback, useEffect, useRef } from 'react'
import { uploadReportImage } from '../api/backend.js'
import { PROGRAMMATIC } from '../editor/authorshipMarks.js'

function replaceSrc(editor, from, to) {
  const { state, view } = editor
  const tr = state.tr.setMeta(PROGRAMMATIC, true).setMeta('addToHistory', false)
  let changed = false
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && node.attrs.src === from) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: to })
      changed = true
    }
  })
  if (changed) view.dispatch(tr)
}

export function useImageUploads({ uid, editor, readOnly, onError }) {
  const inflight = useRef(new Set())
  const errorRef = useRef(onError)

  useEffect(() => {
    errorRef.current = onError
  })

  const uploadPending = useCallback(() => {
    if (!editor || readOnly) return
    editor.state.doc.descendants((node) => {
      const src = node.type.name === 'image' && node.attrs.src
      if (!src || !src.startsWith('data:') || inflight.current.has(src)) return
      inflight.current.add(src)
      uploadReportImage(uid, src)
        .then((image) => replaceSrc(editor, src, image.url))
        .catch((err) => errorRef.current(`Could not upload an image: ${err.message}`))
        .finally(() => inflight.current.delete(src))
    })
  }, [uid, editor, readOnly])

  useEffect(() => {
    uploadPending()
  }, [uploadPending])

  return uploadPending
}
