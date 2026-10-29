import { Box, InputBase, Stack, Typography } from '@mui/material'
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import EditorToolbar from './EditorToolbar.jsx'
import SectionEditor from './SectionEditor.jsx'
import ReviewNavigator from './ReviewNavigator.jsx'
import { DISCLAIMER } from '../report/exportReport.js'
import { formatDate, formatDateTime } from '../report/format.js'

const GUTTER = 88

function SectionTitle({ children, meta }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 1, mt: 3.5 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#334155' }}>
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', alignSelf: 'center' }} />
      {meta}
    </Stack>
  )
}

function PendingMeta({ pending }) {
  if (!pending) return null
  return (
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6d28d9', whiteSpace: 'nowrap' }}>
      {pending} to review
    </Typography>
  )
}

function ContextField({ label, value, onChange, readOnly }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#64748b', mb: 0.5 }}>
        {label}
      </Typography>
      <InputBase
        multiline
        fullWidth
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          fontSize: '0.84rem',
          lineHeight: 1.6,
          color: '#334155',
          px: 1,
          py: 0.5,
          mx: -1,
          borderRadius: 1.5,
          transition: 'background-color 120ms',
          '&:hover': { bgcolor: readOnly ? 'transparent' : '#f8fafc' },
          '&.Mui-focused': { bgcolor: '#f8fafc' },
        }}
      />
    </Box>
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
}) {
  const readOnly = Boolean(finalized)
  const pendingIn = (section) =>
    draft.suggestions.filter((s) => s.section === section && statuses[s.id] === 'pending').length

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
        />
      </EditorToolbar>

      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 1.5, md: 2.5 }, py: 2.5 }}>
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

          <SectionTitle meta={<PendingMeta pending={pendingIn('findings')} />}>Findings</SectionTitle>
          <Box sx={{ ml: '-15px' }}>
            <SectionEditor section="findings" initialContent={initialContent.findings} {...editorProps} />
          </Box>

          <SectionTitle meta={<PendingMeta pending={pendingIn('impression')} />}>Impression</SectionTitle>
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
          {DISCLAIMER}
        </Typography>
        {!readOnly && (
          <Typography noWrap sx={{ fontSize: '0.68rem', color: '#a16207', display: { xs: 'none', xl: 'block' } }}>
            Alt+↓ next · Alt+Enter accept · Alt+⌫ discard
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}
