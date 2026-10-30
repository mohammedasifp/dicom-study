import { useEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { chrome } from '../theme.js'
import { sourceLabel } from '../report/format.js'
import { captureViewport, setKeyImageDrag } from '../report/keyImages.js'
import { checkStudyOnPacs, viewerUrl } from '../api/pacsService.js'

function KeyImageTray({ images, onInsert, onRemove }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', px: 1.5, py: 0.75, bgcolor: chrome.surface, borderBottom: `1px solid ${chrome.border}`, overflowX: 'auto', flexShrink: 0 }}
    >
      <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.06em', color: chrome.muted, whiteSpace: 'nowrap', pr: 0.5 }}>
        KEY IMAGES
        <br />
        <Box component="span" sx={{ fontWeight: 500, letterSpacing: 0 }}>
          drag into report
        </Box>
      </Typography>
      {images.map((img) => (
        <Tooltip key={img.id} title={`${img.caption} · drag into the report, or click to insert at the cursor`}>
          <Box
            draggable
            onDragStart={(e) => setKeyImageDrag(e, img)}
            onClick={() => onInsert(img)}
            sx={{
              position: 'relative',
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid #2b3852',
              cursor: 'grab',
              bgcolor: '#000',
              '&:hover': { borderColor: '#a78bfa' },
              '&:hover .remove': { opacity: 1 },
            }}
          >
            <img src={img.src} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <IconButton
              className="remove"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(img.id)
              }}
              sx={{ position: 'absolute', top: 1, right: 1, width: 18, height: 18, opacity: 0, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', '&:hover': { bgcolor: '#000' } }}
            >
              <CloseRoundedIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        </Tooltip>
      ))}
    </Stack>
  )
}

export default function ViewerPane({ study, target, keyImages, onCapture, onInsertKeyImage, onRemoveKeyImage }) {
  const [status, setStatus] = useState('checking')
  const [attempt, setAttempt] = useState(0)
  const [flash, setFlash] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    checkStudyOnPacs(study.studyInstanceUID, controller.signal).then((result) => result && setStatus(result))
    return () => controller.abort()
  }, [study.studyInstanceUID, attempt])

  const src = viewerUrl(study.studyInstanceUID, target)

  const capture = () => {
    const dataUrl = captureViewport(iframeRef.current)
    if (!dataUrl) return
    onCapture(dataUrl)
    setFlash(true)
    setTimeout(() => setFlash(false), 180)
  }

  return (
    <Stack sx={{ height: '100%', bgcolor: '#000', minWidth: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', px: 1.5, height: 46, flexShrink: 0, bgcolor: chrome.surface, borderBottom: `1px solid ${chrome.border}` }}
      >
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 650, color: chrome.text, whiteSpace: 'nowrap' }}>Images</Typography>
        <Typography noWrap sx={{ fontSize: '0.72rem', color: chrome.muted, flex: 1, minWidth: 0 }}>
          {target ? `Showing ${sourceLabel(target)}` : study.description}
        </Typography>
        <Tooltip title="Capture the current view as a key image">
          <span>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PhotoCameraOutlinedIcon />}
              disabled={status !== 'ready'}
              onClick={capture}
              sx={{ flexShrink: 0, color: '#ddd6fe', borderColor: '#4c3a8a', '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(124,58,237,0.18)' } }}
            >
              Key image
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Reload viewer">
          <IconButton
            size="small"
            onClick={() => {
              setStatus('checking')
              setAttempt((n) => n + 1)
            }}
            sx={{ color: chrome.muted, flexShrink: 0 }}
          >
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open viewer in a new tab">
          <IconButton size="small" component="a" href={src} target="_blank" rel="noreferrer" sx={{ color: chrome.muted, flexShrink: 0 }}>
            <OpenInNewRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {keyImages.length > 0 && <KeyImageTray images={keyImages} onInsert={onInsertKeyImage} onRemove={onRemoveKeyImage} />}

      <Box sx={{ flex: 1, position: 'relative' }}>
        {status === 'ready' && (
          <iframe
            ref={iframeRef}
            key={`${src}#${attempt}`}
            title="OHIF viewer"
            src={src}
            style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
          />
        )}
        {flash && <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />}
        {status === 'checking' && (
          <Stack spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', height: '100%', color: chrome.muted }}>
            <CircularProgress size={24} sx={{ color: chrome.muted }} />
            <Typography variant="caption">Connecting to image server…</Typography>
          </Stack>
        )}
        {(status === 'offline' || status === 'missing') && (
          <Stack spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', height: '100%', px: 4, textAlign: 'center' }}>
            <VisibilityOffOutlinedIcon sx={{ color: '#475569', fontSize: 34 }} />
            <Typography sx={{ color: chrome.text, fontWeight: 600 }}>
              {status === 'offline' ? 'Image server not reachable' : 'Study not found on the image server'}
            </Typography>
            <Typography variant="caption" sx={{ color: chrome.muted, maxWidth: 340 }}>
              {status === 'offline'
                ? 'Start the Orthanc container on port 8042, then reload.'
                : `Upload study ${study.studyInstanceUID} to Orthanc, then reload.`}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  )
}
