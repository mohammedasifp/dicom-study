import { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VerticalSplitOutlinedIcon from '@mui/icons-material/VerticalSplitOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { chrome } from '../theme.js'
import { formatDate, formatDateTime } from '../report/format.js'

function TwoLine({ primary, secondary, sx }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography sx={{ fontSize: '0.84rem', fontWeight: 650, color: chrome.text, lineHeight: 1.25 }} noWrap>
        {primary}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: chrome.muted, lineHeight: 1.35 }} noWrap>
        {secondary}
      </Typography>
    </Box>
  )
}

const darkButton = {
  color: chrome.text,
  borderColor: '#2b3852',
  '&:hover': { borderColor: '#475675', bgcolor: 'rgba(255,255,255,0.04)' },
}

const LAYOUTS = [
  { value: 'report', label: 'Report only', icon: <ArticleOutlinedIcon fontSize="small" /> },
  { value: 'split', label: 'Report and images', icon: <VerticalSplitOutlinedIcon fontSize="small" /> },
  { value: 'viewer', label: 'Images only', icon: <ImageOutlinedIcon fontSize="small" /> },
]

export default function WorkspaceHeader({
  draft,
  finalized,
  counts,
  layout,
  onLayoutChange,
  onBack,
  onHistory,
  onExportJson,
  onExportPdf,
  onFinalize,
  onReopen,
}) {
  const [anchor, setAnchor] = useState(null)
  const { patient, study, model } = draft
  const pending = counts.pending
  const progress = counts.total ? (counts.decided / counts.total) * 100 : 0

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'center', px: 1.5, height: 56, bgcolor: chrome.bg, borderBottom: `1px solid ${chrome.border}`, flexShrink: 0 }}
    >
      <Tooltip title="Back to worklist">
        <IconButton size="small" onClick={onBack} sx={{ color: chrome.muted }}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <TwoLine primary={patient.name} secondary={`${patient.age} · ${patient.sex} · ID ${patient.patientId}`} sx={{ flexShrink: 0 }} />
      <Divider orientation="vertical" flexItem sx={{ borderColor: chrome.border, my: 1.5 }} />
      <TwoLine
        primary={study.description}
        secondary={`${study.modality} · ${formatDate(study.studyDate)} · ${study.accessionNumber}`}
        sx={{ flexShrink: 1 }}
      />

      {model && (
      <Tooltip
        title={
          <>
            {model.zoo} · {model.task}
            <br />
            Run {model.runId} · {formatDateTime(draft.generatedAt)}
          </>
        }
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', display: { xs: 'none', lg: 'flex' },
            px: 1.25,
            height: 30,
            borderRadius: 99,
            border: '1px solid #3b2f6b',
            bgcolor: 'rgba(124,58,237,0.14)',
            flexShrink: 0,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: '#c4b5fd' }} />
          <Typography sx={{ fontSize: '0.74rem', color: '#ddd6fe', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {model.name} <Box component="span" sx={{ color: '#a78bfa' }}>v{model.version}</Box>
          </Typography>
        </Stack>
      </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />

      <ToggleButtonGroup
        size="small"
        exclusive
        value={layout}
        onChange={(_e, v) => v && onLayoutChange(v)}
        sx={{
          flexShrink: 0,
          '& .MuiToggleButton-root': {
            width: 34,
            height: 32,
            color: chrome.muted,
            borderColor: '#2b3852',
            '&.Mui-selected': { color: '#fff', bgcolor: '#1e2a44' },
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
          },
        }}
      >
        {LAYOUTS.map((l) => (
          <ToggleButton key={l.value} value={l.value} aria-label={l.label} title={l.label}>
            {l.icon}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <Tooltip title="Audit trail">
          <IconButton size="small" onClick={onHistory} sx={{ color: chrome.muted, border: '1px solid #2b3852' }}>
            <HistoryRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          endIcon={<ExpandMoreRoundedIcon />}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={darkButton}
        >
          Export
        </Button>
      </Stack>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 280 } } }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null)
            onExportPdf()
          }}
        >
          <ListItemIcon>
            <PictureAsPdfOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="PDF / Print" secondary="Labelled report, AI vs reviewer text" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null)
            onExportJson()
          }}
        >
          <ListItemIcon>
            <DataObjectRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Structured JSON" secondary="Sections, provenance, image links, audit" />
        </MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ borderColor: chrome.border, my: 1.5 }} />

      {finalized ? (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <TaskAltRoundedIcon sx={{ fontSize: 18, color: '#4ade80' }} />
            <TwoLine primary="Final Reviewed Draft" secondary={finalized.reviewer} />
          </Stack>
          <Button size="small" variant="outlined" startIcon={<LockOpenRoundedIcon />} onClick={onReopen} sx={darkButton}>
            Reopen
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} title={`${counts.decided} of ${counts.total} AI points reviewed`}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress variant="determinate" value={100} size={26} thickness={5} sx={{ color: '#1f2a40' }} />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={26}
                thickness={5}
                sx={{ color: pending ? '#fbbf24' : '#4ade80', position: 'absolute', left: 0 }}
              />
            </Box>
            <TwoLine
              primary="AI Draft"
              secondary={pending ? 'Review in progress' : 'Ready to finalize'}
            />
          </Stack>
          <Tooltip title={pending ? `${pending} suggestion${pending > 1 ? 's' : ''} still to review` : ''}>
            <span>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<TaskAltRoundedIcon />}
                disabled={pending > 0}
                onClick={onFinalize}
                sx={{
                  '&.Mui-disabled': { bgcolor: '#1a2438', color: '#56627b' },
                  ...(pending === 0 && {
                    animation: 'finalize-ready 1.6s ease-out 2',
                    '@keyframes finalize-ready': {
                      '0%': { boxShadow: '0 0 0 0 rgba(74,222,128,0.55)' },
                      '100%': { boxShadow: '0 0 0 10px rgba(74,222,128,0)' },
                    },
                  }),
                }}
              >
                Finalize
              </Button>
            </span>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  )
}
