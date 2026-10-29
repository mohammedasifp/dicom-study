import { useEffect, useState } from 'react'
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined'
import RoiThumbnail from './RoiThumbnail.jsx'
import { chrome } from '../theme.js'
import { confidenceLevel, percent, sourceLabel } from '../report/format.js'

const CONF_COLOR = { success: '#4ade80', warning: '#fbbf24', error: '#f87171' }

function viewerUrl(studyInstanceUID, target) {
  const params = new URLSearchParams({ StudyInstanceUIDs: studyInstanceUID })
  if (target) {
    params.set('initialSeriesInstanceUID', target.seriesInstanceUID)
    params.set('initialSOPInstanceUID', target.sopInstanceUID)
  }
  return `/ohif/viewer?${params.toString()}`
}

function EvidenceStrip({ active, target, onShowInViewer }) {
  if (!active) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: chrome.muted, minWidth: 0 }}>
        <TouchAppOutlinedIcon sx={{ fontSize: 17 }} />
        <Typography noWrap sx={{ fontSize: '0.76rem' }}>
          Click a finding in the report to see its source image and region of interest
        </Typography>
      </Stack>
    )
  }

  const suggestion = active
  const { index } = active
  const src = suggestion.source
  const level = confidenceLevel(suggestion.confidence)
  const showing = target && src && target.sopInstanceUID === src.sopInstanceUID

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
      {src && (
        <Tooltip
          placement="bottom-start"
          slotProps={{ tooltip: { sx: { p: 0.5, bgcolor: '#000', maxWidth: 'none' } } }}
          title={<RoiThumbnail source={src} roi={suggestion.roi} size={240} />}
        >
          <Box sx={{ cursor: 'zoom-in', lineHeight: 0 }}>
            <RoiThumbnail source={src} roi={suggestion.roi} size={40} compact />
          </Box>
        </Tooltip>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              px: 0.6,
              borderRadius: 1,
              bgcolor: '#7c3aed',
              color: '#fff',
              fontSize: '0.66rem',
              fontWeight: 700,
              lineHeight: '17px',
              flexShrink: 0,
            }}
          >
            {index}
          </Box>
          <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 650, color: chrome.text }}>
            {suggestion.observation}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: CONF_COLOR[level.color], flexShrink: 0 }}>
            {percent(suggestion.confidence)}
          </Typography>
          {suggestion.limitation && (
            <Tooltip title={suggestion.limitation}>
              <WarningAmberRoundedIcon sx={{ fontSize: 15, color: '#fbbf24', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Stack>
        <Typography noWrap sx={{ fontSize: '0.7rem', color: chrome.muted, mt: 0.25 }}>
          {src ? `${sourceLabel(src)}${suggestion.roi ? ' · ROI marked' : ' · no localisation'}` : 'Study-level suggestion, no source image'}
        </Typography>
      </Box>
      {src && (
        <Button
          size="small"
          variant={showing ? 'text' : 'contained'}
          startIcon={<CenterFocusStrongRoundedIcon />}
          disabled={showing}
          onClick={onShowInViewer}
          sx={{
            flexShrink: 0,
            bgcolor: showing ? 'transparent' : '#7c3aed',
            '&:hover': { bgcolor: '#6d28d9' },
            '&.Mui-disabled': { color: chrome.muted },
          }}
        >
          {showing ? 'Showing' : 'Show image'}
        </Button>
      )}
    </Stack>
  )
}

export default function ViewerPane({ study, target, active, onShowInViewer }) {
  const [status, setStatus] = useState('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch(`/dicom-web/studies?StudyInstanceUID=${study.studyInstanceUID}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((rows) => !cancelled && setStatus(Array.isArray(rows) && rows.length ? 'ready' : 'missing'))
      .catch(() => !cancelled && setStatus('offline'))
    return () => {
      cancelled = true
    }
  }, [study.studyInstanceUID, attempt])

  const src = viewerUrl(study.studyInstanceUID, target)

  return (
    <Stack sx={{ height: '100%', bgcolor: '#000', minWidth: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', px: 1.5, height: 58, flexShrink: 0, bgcolor: chrome.surface, borderBottom: `1px solid ${chrome.border}` }}
      >
        <EvidenceStrip active={active} target={target} onShowInViewer={onShowInViewer} />
        <Box sx={{ flex: active ? 0 : 1 }} />
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

      <Box sx={{ flex: 1, position: 'relative' }}>
        {status === 'ready' && (
          <iframe
            key={`${src}#${attempt}`}
            title="OHIF viewer"
            src={src}
            style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
          />
        )}
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
