import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import RoiThumbnail from './RoiThumbnail.jsx'
import { confidenceLevel, confidenceText } from '../report/format.js'
import { composeRoiImage, setKeyImageDrag, suggestionCaption } from '../report/keyImages.js'

const GAP = 8
const CONF_TEXT = { success: '#15803d', warning: '#b45309', error: '#dc2626', none: '#8A98A8' }

const STATUS = {
  pending: { label: 'To review', color: '#6d28d9', icon: null },
  accepted: { label: 'Accepted', color: '#15803d', icon: <TaskAltRoundedIcon sx={{ fontSize: 14 }} /> },
  edited: { label: 'Edited', color: '#0369a1', icon: <EditNoteRoundedIcon sx={{ fontSize: 15 }} /> },
}

function SourceLink({ suggestion, showing, onClick }) {
  const src = suggestion.source
  if (!src) {
    return (
      <Typography sx={{ fontSize: '0.68rem', color: '#8A98A8' }} noWrap>
        Study-level, no source image
      </Typography>
    )
  }
  return (
    <Box
      component="button"
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={showing ? 'Showing in the viewer' : 'Show in the viewer'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        maxWidth: '100%',
        p: 0,
        border: 0,
        bgcolor: 'transparent',
        font: 'inherit',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: showing ? '#6d28d9' : '#5B6B7F',
        cursor: 'pointer',
        '&:hover': { color: '#6d28d9', textDecoration: 'underline' },
      }}
    >
      <ImageOutlinedIcon sx={{ fontSize: 13, flexShrink: 0 }} />
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        S{src.seriesNumber} · {src.seriesDescription} · Img {src.instanceNumber}
      </Box>
      {suggestion.roi && (
        <Box component="span" sx={{ flexShrink: 0, fontSize: '0.58rem', fontWeight: 700, color: '#a16207', bgcolor: '#fef9c3', px: 0.4, borderRadius: 0.5 }}>
          ROI
        </Box>
      )}
    </Box>
  )
}

function DraggableEvidence({ suggestion }) {
  const [keyImage, setKeyImage] = useState(null)
  useEffect(() => {
    let alive = true
    composeRoiImage(suggestion.source, suggestion.roi)
      .then((src) => alive && setKeyImage({ src, caption: suggestionCaption(suggestion) }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [suggestion])

  return (
    <Tooltip title="Drag into the report to add as a key image" placement="left">
      <Box
        role="img"
        aria-label={`Evidence image for #${suggestion.index}, drag into the report`}
        draggable={Boolean(keyImage)}
        onDragStart={(e) => keyImage && setKeyImageDrag(e, keyImage)}
        sx={{ position: 'relative', cursor: keyImage ? 'grab' : 'default', lineHeight: 0, flexShrink: 0 }}
      >
        <RoiThumbnail source={suggestion.source} roi={suggestion.roi} size={72} />
        <DragIndicatorRoundedIcon sx={{ position: 'absolute', right: 1, top: 2, fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
      </Box>
    </Tooltip>
  )
}

function RailCard({ suggestion, status, active, showing, readOnly, onAction, onHover, cardRef, top }) {
  const level = confidenceLevel(suggestion.confidence)
  const meta = STATUS[status]

  return (
    <Box
      ref={cardRef}
      onClick={() => onAction('select', suggestion.id)}
      onMouseEnter={() => onHover(suggestion.id)}
      onMouseLeave={() => onHover(null)}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        transition: 'top 160ms ease, box-shadow 140ms, border-color 140ms',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: active ? '#c4b5fd' : '#DCE7E6',
        borderLeft: `3px solid ${status === 'pending' ? '#8b5cf6' : active ? '#c4b5fd' : '#DCE7E6'}`,
        borderRadius: 2,
        px: 1.25,
        py: 0.9,
        cursor: 'pointer',
        boxShadow: active ? '0 6px 20px rgba(76,29,149,0.12)' : 'none',
        zIndex: active ? 2 : 1,
        '&:hover': { borderColor: active ? '#c4b5fd' : '#B9CFCD' },
      }}
    >
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box
          sx={{
            minWidth: 18,
            height: 18,
            px: 0.4,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.64rem',
            fontWeight: 700,
            color: status === 'pending' ? '#fff' : '#6d28d9',
            bgcolor: status === 'pending' ? '#8b5cf6' : '#f5f3ff',
            flexShrink: 0,
          }}
        >
          {suggestion.index}
        </Box>
        <Typography noWrap sx={{ fontSize: '0.76rem', fontWeight: 650, flex: 1, minWidth: 0 }}>
          {suggestion.observation}
        </Typography>
        {status === 'pending' ? (
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: CONF_TEXT[level.color], flexShrink: 0 }}>
            {confidenceText(suggestion.confidence)}
          </Typography>
        ) : (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: meta.color, flexShrink: 0 }} title={meta.label}>
            {meta.icon}
          </Box>
        )}
        {suggestion.limitation && status === 'pending' && <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#d97706', flexShrink: 0 }} />}
      </Stack>

      <Box sx={{ mt: 0.4, pl: '24px', minWidth: 0 }}>
        <SourceLink suggestion={suggestion} showing={showing} onClick={() => onAction('source', suggestion.id)} />
      </Box>

      {active && (
        <Box sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            {suggestion.source && <DraggableEvidence suggestion={suggestion} />}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: '0.66rem', color: '#5B6B7F' }}>Model confidence</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: CONF_TEXT[level.color] }}>
                {typeof suggestion.confidence === 'number' ? `${level.label} · ${confidenceText(suggestion.confidence)}` : 'Not given by the model'}
              </Typography>
              {typeof suggestion.confidence === 'number' && (
                <Box sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#EEF5F4', overflow: 'hidden' }}>
                  <Box sx={{ width: confidenceText(suggestion.confidence), height: '100%', bgcolor: CONF_TEXT[level.color] }} />
                </Box>
              )}
            </Box>
          </Stack>

          {suggestion.limitation && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, p: 0.75, borderRadius: 1.5, bgcolor: '#fffbeb' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#d97706', mt: '1px' }} />
              <Typography sx={{ fontSize: '0.68rem', color: '#78350f', lineHeight: 1.45 }}>{suggestion.limitation}</Typography>
            </Stack>
          )}

          {!readOnly && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }}>
              {status === 'pending' && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckRoundedIcon />}
                    onClick={() => onAction('accept', suggestion.id)}
                    sx={{ flex: 1, height: 28, fontSize: '0.74rem' }}
                    title="Accept (Alt+Enter)"
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<CloseRoundedIcon />}
                    onClick={() => onAction('discard', suggestion.id)}
                    sx={{ flex: 1, height: 28, fontSize: '0.74rem', color: '#5B6B7F', borderColor: '#B9CFCD' }}
                    title="Discard (Alt+Backspace)"
                  >
                    Discard
                  </Button>
                </>
              )}
              {status === 'accepted' && (
                <Button size="small" color="inherit" startIcon={<ReplayRoundedIcon />} onClick={() => onAction('unaccept', suggestion.id)} sx={{ height: 28, fontSize: '0.72rem', color: '#5B6B7F' }}>
                  Undo accept
                </Button>
              )}
              {status === 'edited' && (
                <Tooltip title={`AI wording: "${suggestion.text}"`}>
                  <Button size="small" color="inherit" startIcon={<ReplayRoundedIcon />} onClick={() => onAction('revert', suggestion.id)} sx={{ height: 28, fontSize: '0.72rem', color: '#5B6B7F' }}>
                    Revert to AI wording
                  </Button>
                </Tooltip>
              )}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  )
}

export default function SuggestionRail({ suggestions, statuses, activeId, showingId, readOnly, layoutTick, onAction, onHover }) {
  const railRef = useRef(null)
  const cardRefs = useRef({})
  const [tops, setTops] = useState({})
  const [height, setHeight] = useState(0)

  const visible = suggestions.filter((s) => statuses[s.id] !== 'discarded')

  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const row = rail.parentElement
    const base = rail.getBoundingClientRect().top
    const items = suggestions
      .filter((s) => statuses[s.id] !== 'discarded')
      .map((s) => {
        const anchor = row.querySelector(`.ProseMirror [data-suggestion-id="${s.id}"]`)
        const card = cardRefs.current[s.id]
        if (!anchor || !card) return null
        return { id: s.id, anchor: anchor.getBoundingClientRect().top - base - 6, h: card.offsetHeight }
      })
      .filter(Boolean)
      .sort((a, b) => a.anchor - b.anchor)

    const next = {}
    const pivot = Math.max(0, items.findIndex((i) => i.id === activeId))
    if (items.length) {
      next[items[pivot].id] = items[pivot].anchor
      for (let i = pivot + 1; i < items.length; i += 1) {
        const prev = items[i - 1]
        next[items[i].id] = Math.max(items[i].anchor, next[prev.id] + prev.h + GAP)
      }
      for (let i = pivot - 1; i >= 0; i -= 1) {
        const below = items[i + 1]
        next[items[i].id] = Math.min(items[i].anchor, next[below.id] - items[i].h - GAP)
      }
      const shift = Math.min(0, ...items.map((i) => next[i.id]))
      if (shift < 0) items.forEach((i) => (next[i.id] -= shift))
    }
    const last = items[items.length - 1]
    const nextHeight = last ? next[last.id] + last.h : 0
    setTops((prev) => {
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.entries(next).every(([k, v]) => Math.abs((prev[k] ?? -1) - v) < 0.5)
      return same ? prev : next
    })
    setHeight((prev) => (Math.abs(nextHeight - prev) > 0.5 ? nextHeight : prev))
  }, [suggestions, statuses, activeId, showingId, layoutTick, tops])

  return (
    <Box ref={railRef} sx={{ position: 'relative', width: 252, flexShrink: 0, minHeight: height }}>
      {visible.map((s) => (
        <RailCard
          key={s.id}
          suggestion={s}
          status={statuses[s.id]}
          active={s.id === activeId}
          showing={s.id === showingId}
          readOnly={readOnly}
          onAction={onAction}
          onHover={onHover}
          top={tops[s.id] ?? 0}
          cardRef={(node) => {
            cardRefs.current[s.id] = node
          }}
        />
      ))}
    </Box>
  )
}
