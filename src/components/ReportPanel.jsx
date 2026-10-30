import { useState } from 'react'
import { Box, InputBase, Popover, Stack, Typography } from '@mui/material'
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import EditorToolbar from './EditorToolbar.jsx'
import SectionEditor from './SectionEditor.jsx'
import ReviewNavigator from './ReviewNavigator.jsx'
import { DISCLAIMER, DISCLAIMER_SHORT } from '../report/exportReport.js'
import { formatDate, formatDateTime } from '../report/format.js'

const GUTTER = 88

const SHORTCUTS = [
  ['Alt + ↓ / ↑', 'Next / previous point to review'],
  ['Alt + Enter', 'Accept the current point'],
  ['Alt + Backspace', 'Discard the current point'],
  ['Ctrl + Z', 'Undo the last edit'],
]

function SectionTitle({ children }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1, mt: 3.5 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#334155' }}>
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Stack>
  )
}

const fieldText = { fontSize: '0.82rem', lineHeight: 1.6, color: '#475569' }

function ContextField({ label, value, onChange, readOnly }) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', mb: 0.25 }}>
        {label}
      </Typography>
      {open && !readOnly ? (
        <InputBase
          multiline
          fullWidth
          autoFocus
          value={value}
          onBlur={() => setOpen(false)}
          onChange={(e) => onChange(e.target.value)}
          sx={{ ...fieldText, px: 1, py: 0.5, mx: -1, borderRadius: 1.5, bgcolor: '#f8fafc', boxShadow: 'inset 0 0 0 1px #cbd5e1' }}
        />
      ) : (
        <Box
          role="button"
          tabIndex={0}
          title={readOnly ? value : 'Click to edit'}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
          sx={{
            ...fieldText,
            px: 1,
            py: 0.5,
            mx: -1,
            borderRadius: 1.5,
            cursor: readOnly ? 'default' : 'text',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            '&:hover': { bgcolor: readOnly ? 'transparent' : '#f8fafc' },
          }}
        >
          {value}
        </Box>
      )}
    </Box>
  )
}

function ShortcutsButton() {
  const [anchor, setAnchor] = useState(null)
  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          border: 0,
          bgcolor: 'transparent',
          color: '#a16207',
          font: 'inherit',
          fontSize: '0.7rem',
          fontWeight: 600,
          cursor: 'pointer',
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: '#fef3c7' },
        }}
      >
        <KeyboardOutlinedIcon sx={{ fontSize: 15 }} />
        Shortcuts
      </Box>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, mt: -1, width: 300, boxShadow: '0 12px 32px rgba(15,23,42,0.16)' } } }}
      >
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>KEYBOARD SHORTCUTS</Typography>
        <Stack spacing={0.75}>
          {SHORTCUTS.map(([keys, label]) => (
            <Stack key={keys} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                component="kbd"
                sx={{
                  minWidth: 112,
                  fontFamily: 'inherit',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                {keys}
              </Box>
              <Typography sx={{ fontSize: '0.76rem' }}>{label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Popover>
    </>
  )
}

export default function ReportPanel({
  draft,
  fields,
  onFieldChange,
  initialContent,
  suggestionInfo,
  statuses,
  counts,
  finalized,
  showAuthorship,
  onToggleAuthorship,
  activeEditor,
  activeId,
  showingId,
  discarded,
  onEditorReady,
  onEditorFocus,
  onScan,
  onSuggestionFocus,
  onReviewAction,
  onRestore,
  onFinalize,
}) {
  const readOnly = Boolean(finalized)

  const editorProps = {
    suggestionInfo,
    editable: !readOnly,
    statuses,
    activeId,
    showingId,
    onReady: onEditorReady,
    onFocus: onEditorFocus,
    onScan,
    onSuggestionFocus,
    onReviewAction,
  }

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.default', minWidth: 0 }}>
      <EditorToolbar
        editor={activeEditor}
        disabled={readOnly}
        showAuthorship={showAuthorship}
        onToggleAuthorship={onToggleAuthorship}
      >
        <ReviewNavigator
          counts={counts}
          discarded={discarded}
          readOnly={readOnly}
          onPrev={() => onReviewAction('prev')}
          onNext={() => onReviewAction('next')}
          onRestore={onRestore}
          onFinalize={onFinalize}
        />
      </EditorToolbar>

      <Box className="report-scroll" sx={{ flex: 1, overflowY: 'auto', px: { xs: 1.5, md: 2.5 }, py: 2.5 }}>
        <Box
          className={`report-doc${showAuthorship ? ' show-authorship' : ''}${readOnly ? ' is-readonly' : ''}`}
          sx={{
            maxWidth: 820,
            mx: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2.5,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.04)',
            pt: 3.5,
            pb: 4,
            pr: { xs: 2.5, md: 4 },
            pl: `${GUTTER}px`,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em', color: '#94a3b8' }}>
                RADIOLOGY REPORT
              </Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', mt: 0.25 }}>
                {draft.study.description}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>
                {draft.patient.name} · {draft.patient.age} {draft.patient.sex} · {formatDate(draft.study.studyDate)} · Ref.{' '}
                {draft.study.referringPhysician}
              </Typography>
            </Box>
            {finalized ? (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', px: 1, py: 0.5, borderRadius: 1.5, bgcolor: 'success.light', flexShrink: 0 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 15, color: 'success.main' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'success.dark' }}>FINAL REVIEWED DRAFT</Typography>
              </Stack>
            ) : (
              <Box sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: '#fef3c7', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>AI DRAFT · UNDER REVIEW</Typography>
              </Box>
            )}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              columnGap: 3,
              rowGap: 1.5,
              mt: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ContextField label="Clinical history" value={fields.clinicalHistory} readOnly={readOnly} onChange={(v) => onFieldChange('clinicalHistory', v)} />
            <ContextField label="Technique" value={fields.technique} readOnly={readOnly} onChange={(v) => onFieldChange('technique', v)} />
          </Box>

          <SectionTitle>Findings</SectionTitle>
          <Box sx={{ ml: '-15px' }}>
            <SectionEditor section="findings" initialContent={initialContent.findings} {...editorProps} />
          </Box>

          <SectionTitle>Impression</SectionTitle>
          <Box sx={{ ml: '-15px' }}>
            <SectionEditor section="impression" initialContent={initialContent.impression} {...editorProps} />
          </Box>

          <Box sx={{ mt: 3.5, p: 1.5, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.75 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#92400e' }}>AI uncertainty & limitations</Typography>
            </Stack>
            <Box component="ul" sx={{ m: 0, pl: 2.75 }}>
              {draft.limitations.map((item) => (
                <Typography component="li" key={item} sx={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.55 }}>
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8' }}>REVIEWED BY</Typography>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, mt: 0.25, color: finalized ? 'text.primary' : '#94a3b8' }}>
              {finalized ? `${finalized.reviewer} · ${formatDateTime(finalized.at)}` : 'Awaiting radiologist sign-off'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', px: 2, height: 30, flexShrink: 0, borderTop: 1, borderColor: 'divider', bgcolor: '#fffbeb' }}
      >
        <GppMaybeOutlinedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
        <Typography noWrap sx={{ fontSize: '0.7rem', color: '#78350f', flex: 1 }} title={DISCLAIMER}>
          {DISCLAIMER_SHORT}
        </Typography>
        {!readOnly && <ShortcutsButton />}
      </Stack>
    </Stack>
  )
}
