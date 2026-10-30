import { useState } from 'react'
import { Box, Popover, Stack, Typography } from '@mui/material'
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import EditorToolbar from './EditorToolbar.jsx'
import ReportEditor from './ReportEditor.jsx'
import ReviewNavigator from './ReviewNavigator.jsx'
import SuggestionRail from './SuggestionRail.jsx'
import { DISCLAIMER, DISCLAIMER_SHORT } from '../report/exportReport.js'
import { formatDate, formatDateTime } from '../report/format.js'

const SHORTCUTS = [
  ['Alt + ↓ / ↑', 'Next / previous point to review'],
  ['Alt + Enter', 'Accept the current point'],
  ['Alt + Backspace', 'Discard the current point'],
  ['Ctrl + Z', 'Undo the last edit'],
]

function FooterButton({ icon, label, children }) {
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
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: '#fef3c7' },
        }}
      >
        {icon}
        {label}
      </Box>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.75, mt: -1, width: 340, boxShadow: '0 12px 32px rgba(15,23,42,0.16)' } } }}
      >
        {children}
      </Popover>
    </>
  )
}

const popTitle = { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', color: 'text.secondary', mb: 1 }

function SaveIndicator({ state, onRetry }) {
  if (!state || state.status === 'idle') return null
  if (state.status === 'error') {
    return (
      <Box
        component="button"
        type="button"
        onClick={onRetry}
        sx={{ border: 0, bgcolor: 'transparent', font: 'inherit', fontSize: '0.72rem', fontWeight: 600, color: 'error.main', cursor: 'pointer', mr: 1, whiteSpace: 'nowrap' }}
      >
        Not saved · Retry
      </Box>
    )
  }
  const text =
    state.status === 'saving'
      ? 'Saving…'
      : `Saved ${new Date(state.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
  return <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mr: 1, whiteSpace: 'nowrap' }}>{text}</Typography>
}

function HeaderField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em', color: '#8A98A8', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function ReportPanel({
  draft,
  initialContent,
  suggestions,
  statuses,
  counts,
  finalized,
  showAuthorship,
  onToggleAuthorship,
  editor,
  activeId,
  hoverId,
  showingId,
  layoutTick,
  discarded,
  onEditorReady,
  onScan,
  onSuggestionFocus,
  onReviewAction,
  onHover,
  onTransaction,
  onRestore,
  onFinalize,
  saveState,
  onRetrySave,
}) {
  const readOnly = Boolean(finalized)
  const { patient, study, model } = draft

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.default', minWidth: 0 }}>
      <EditorToolbar editor={editor} disabled={readOnly} showAuthorship={showAuthorship} onToggleAuthorship={onToggleAuthorship}>
        {!readOnly && <SaveIndicator state={saveState} onRetry={onRetrySave} />}
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

      <Box className="report-scroll" sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'center', position: 'relative' }}>
          <Box
            className={`report-doc${showAuthorship ? ' show-authorship' : ''}${readOnly ? ' is-readonly' : ''}`}
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              maxWidth: 780,
              bgcolor: 'background.paper',
              borderRadius: 1.5,
              border: '1px solid #DCE7E6',
              boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              px: { xs: 3, md: 5 },
              pt: 4,
              pb: 5,
            }}
          >
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: '#1E293B' }}>
              {study.description}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 1.25,
                mt: 1.5,
                pb: 2,
                mb: 1,
                borderBottom: '2px solid #0f172a',
              }}
            >
              <HeaderField label="Patient" value={patient.name} />
              <HeaderField label="Patient ID" value={patient.patientId} />
              <HeaderField label="Age / Sex" value={`${patient.age} / ${patient.sex}`} />
              <HeaderField label="Study date" value={formatDate(study.studyDate)} />
              <HeaderField label="Accession" value={study.accessionNumber} />
              <HeaderField label="Referred by" value={study.referringPhysician} />
            </Box>

            <ReportEditor
              initialContent={initialContent}
              editable={!readOnly}
              statuses={statuses}
              activeId={activeId}
              hoverId={hoverId}
              onReady={onEditorReady}
              onScan={onScan}
              onSuggestionFocus={onSuggestionFocus}
              onReviewAction={onReviewAction}
              onTransaction={onTransaction}
            />

            <Box sx={{ mt: 5, pt: 1.5, borderTop: '1px solid #DCE7E6', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em', color: '#8A98A8' }}>REPORTED BY</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: finalized ? '#1E293B' : '#8A98A8' }}>
                  {finalized ? finalized.reviewer : 'Awaiting radiologist sign-off'}
                </Typography>
              </Box>
              {finalized && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em', color: '#8A98A8' }}>SIGNED</Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDateTime(finalized.at)}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <SuggestionRail
            suggestions={suggestions}
            statuses={statuses}
            activeId={activeId}
            showingId={showingId}
            readOnly={readOnly}
            layoutTick={layoutTick}
            onAction={onReviewAction}
            onHover={onHover}
          />
        </Stack>
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
        {model && (
        <FooterButton icon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />} label="AI model notes">
          <Typography sx={popTitle}>
            {model.name} v{model.version} · {model.zoo}
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', mb: 1.25 }}>
            {[model.task, draft.generatedAt && formatDateTime(draft.generatedAt)].filter(Boolean).join(' · ')}
          </Typography>
          <Typography sx={popTitle}>UNCERTAINTY & LIMITATIONS</Typography>
          {draft.uncertainty && <Typography sx={{ fontSize: '0.74rem', lineHeight: 1.55, mb: 0.75 }}>{draft.uncertainty}</Typography>}
          <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
            {draft.limitations.map((item) => (
              <Typography component="li" key={item} sx={{ fontSize: '0.74rem', lineHeight: 1.55, mb: 0.5 }}>
                {item}
              </Typography>
            ))}
          </Box>
        </FooterButton>
        )}
        {!readOnly && (
          <FooterButton icon={<KeyboardOutlinedIcon sx={{ fontSize: 15 }} />} label="Shortcuts">
            <Typography sx={popTitle}>KEYBOARD SHORTCUTS</Typography>
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
                      bgcolor: '#EEF5F4',
                      border: '1px solid #DCE7E6',
                      textAlign: 'center',
                    }}
                  >
                    {keys}
                  </Box>
                  <Typography sx={{ fontSize: '0.76rem' }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </FooterButton>
        )}
      </Stack>
    </Stack>
  )
}
