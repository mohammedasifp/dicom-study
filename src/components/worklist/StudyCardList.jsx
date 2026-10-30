import { Box, Paper, Stack, Typography } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDateTime } from '../../i18n/format.js'
import { PRIORITY, STUDY_STATUS } from '../../constants/study.js'
import { colors, priorityColors, typography } from '../../styles/tokens.js'
import { AiDraftIndicator, ModalityBadge, PriorityBadge, StatusBadge } from './StudyBadges.jsx'
import { AssigneeLabel } from './Assignment.jsx'
import SlaTimer from './SlaTimer.jsx'
import StudyActions from './StudyActions.jsx'

// Phone / small-tablet layout of the worklist: one card per study, same data and actions as the table.
export default function StudyCardList({ studies, now, radiologists, radiologistsById, currentUserId, busyIds, onOpen, onAssign }) {
  const { t, intlLocale } = useI18n()
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 1, display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }} aria-label={t('worklist.tableLabel')}>
      {studies.map((study) => {
        const completed = study.status === STUDY_STATUS.COMPLETED
        return (
          <Paper
            component="li"
            key={study.id}
            tabIndex={0}
            onClick={() => onOpen(study)}
            onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onOpen(study)}
            aria-label={t('worklist.openStudy', { patient: study.patient.name, study: study.description })}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              border: 1,
              borderColor: 'divider',
              borderLeft: `4px solid ${priorityColors[study.priority].bar === 'transparent' ? colors.border.default : priorityColors[study.priority].bar}`,
              bgcolor: study.priority === PRIORITY.STAT && !completed ? colors.danger.light : 'background.paper',
              '&:focus-visible': { outline: `2px solid ${colors.border.focus}` },
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
                  {study.patient.name}
                </Typography>
                <Typography noWrap sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                  {study.patient.uhid} · {study.patient.age} / {t(`sex.${study.patient.sex}`)} · {t(`patientClass.${study.patientClass}`)}
                </Typography>
              </Box>
              <PriorityBadge priority={study.priority} />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
              <ModalityBadge modality={study.modality} />
              <Typography noWrap sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, minWidth: 0 }}>
                {study.description}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary, mt: 0.5 }}>
              {t('study.accessionShort')} {study.accessionNumber} · {formatDateTime(study.studyDateTime, intlLocale)} · {study.referringDoctor}
            </Typography>

            <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <StatusBadge status={study.status} />
              <SlaTimer study={study} now={now} />
              <AiDraftIndicator status={study.aiDraftStatus} />
              <Box sx={{ ml: 'auto' }}>
                <AssigneeLabel radiologist={radiologistsById[study.assignedTo]} isCurrentUser={study.assignedTo === currentUserId} />
              </Box>
            </Stack>

            <Box sx={{ mt: 1.25 }}>
              <StudyActions
                study={study}
                radiologists={radiologists}
                currentUserId={currentUserId}
                busy={busyIds.includes(study.id)}
                onOpen={onOpen}
                onAssign={onAssign}
                fullWidth
              />
            </Box>
          </Paper>
        )
      })}
    </Box>
  )
}
