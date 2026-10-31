import { useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded'
import { useI18n } from '../i18n/I18nContext.js'
import { useNow } from '../hooks/useNow.js'
import { useOpsDashboard } from '../hooks/useOpsDashboard.js'
import { errorMessageKey } from '../api/errors.js'
import WorklistAppBar from '../components/worklist/WorklistAppBar.jsx'
import StateMessage from '../components/common/StateMessage.jsx'
import StagePipeline from '../components/ops/StagePipeline.jsx'
import StagePatients from '../components/ops/StagePatients.jsx'
import ExceptionTable from '../components/ops/ExceptionTable.jsx'
import ResolveDialog from '../components/ops/ResolveDialog.jsx'
import OpsFeed from '../components/ops/OpsFeed.jsx'
import EodSummaryDialog from '../components/ops/EodSummaryDialog.jsx'
import DemoInjectButton from '../components/ops/DemoInjectButton.jsx'
import { EXCEPTION_VIEWS, matchesView } from '../components/ops/opsConstants.js'
import { colors, radius, shadows, typography } from '../styles/tokens.js'

function StatTile({ label, detail, value, alert }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: `${radius.lg}px`,
        border: '1px solid',
        borderColor: alert ? colors.danger.border : colors.border.default,
        bgcolor: alert ? colors.danger.light : 'background.paper',
        boxShadow: shadows.card,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography sx={{ fontSize: typography.size.xxl, fontWeight: typography.weight.bold, lineHeight: 1.1, color: alert ? colors.danger.dark : colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography noWrap sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
          {label}
        </Typography>
      </Box>
      <Typography noWrap sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
        {detail}
      </Typography>
    </Box>
  )
}

export default function OperationsDashboard({ onOpenStudy, onHome, onNavigate, onLogout }) {
  const { t } = useI18n()
  const now = useNow(15000)
  const ops = useOpsDashboard()
  const [view, setView] = useState('active')
  const [stage, setStage] = useState(null)
  const [resolving, setResolving] = useState(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const data = ops.data

  const rows = useMemo(
    () => (data ? data.exceptions.filter((e) => matchesView(e, view)) : []),
    [data, view],
  )

  let content
  if (ops.status === 'loading') content = <StateMessage variant="loading" sx={{ height: '100%' }} />
  else if (ops.status === 'error')
    content = (
      <StateMessage
        variant="error"
        title={t('ops.loadError')}
        description={t(errorMessageKey(ops.error))}
        action={<Button variant="contained" onClick={ops.refresh}>{t('common.retry')}</Button>}
      />
    )
  else {
    const critical = data.counts.bySeverity.CRITICAL || 0
    content = (
      <Stack spacing={2} sx={{ maxWidth: 1800, mx: 'auto', p: { xs: 1.5, md: 2 } }}>
        <Alert severity="warning" variant="outlined" sx={{ bgcolor: 'background.paper', fontSize: typography.size.sm }}>
          {data.disclaimer}
        </Alert>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography component="h1" sx={{ fontSize: typography.size.xl, fontWeight: typography.weight.bold }}>
            {t('ops.title')}
          </Typography>
          <Stack direction="row" spacing={1}>
            {data.demoControls && <DemoInjectButton busy={ops.busy === 'inject'} onInject={ops.inject} />}
            <Button size="small" variant="outlined" startIcon={<SummarizeRoundedIcon />} onClick={() => setSummaryOpen(true)}>
              {t('ops.summary.open')}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
          <StatTile label={t('ops.stats.open')} detail={t('ops.stats.openDetail')} value={data.counts.open} alert={data.counts.open > 0} />
          <StatTile label={t('ops.stats.critical')} detail={t('ops.stats.criticalDetail')} value={critical} alert={critical > 0} />
          <StatTile label={t('ops.stats.unassigned')} detail={t('ops.stats.unassignedDetail')} value={data.counts.unassigned} />
          <StatTile label={t('ops.stats.resolved')} detail={t('ops.stats.resolvedDetail')} value={data.counts.resolvedToday} />
        </Box>

        <StagePipeline stages={data.stages} activeStage={stage} onSelectStage={setStage} />

        {stage && <StagePatients stage={stage} now={now} refreshKey={data} onClose={() => setStage(null)} onOpenStudy={onOpenStudy} />}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 320px' }, alignItems: 'start' }}>
          <Paper sx={{ border: 1, borderColor: 'divider', boxShadow: shadows.card, overflow: 'clip' }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ p: 1.5, flexWrap: 'wrap', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              {EXCEPTION_VIEWS.map((v) => (
                <Chip
                  key={v}
                  size="small"
                  label={t(`ops.view.${v}`)}
                  color={view === v ? 'primary' : 'default'}
                  variant={view === v ? 'filled' : 'outlined'}
                  onClick={() => setView(v)}
                />
              ))}
            </Stack>
            {rows.length ? (
              <ExceptionTable
                exceptions={rows}
                now={now}
                radiologists={ops.radiologists}
                currentUserId={ops.currentUser?.id}
                busy={ops.busy}
                onAcknowledge={ops.acknowledge}
                onAssign={ops.assign}
                onResolve={setResolving}
                onOpenStudy={onOpenStudy}
              />
            ) : (
              <StateMessage title={t('ops.empty.title')} description={t(view === 'active' ? 'ops.empty.active' : 'ops.empty.filtered')} />
            )}
          </Paper>
          <OpsFeed feed={data.feed} />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.default' }}>
      <WorklistAppBar
        currentUser={ops.currentUser}
        refreshing={ops.refreshing}
        onRefresh={ops.refresh}
        onHome={onHome}
        section="operations"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {content}
      </Box>

      {resolving && (
        <ResolveDialog
          exception={resolving}
          onCancel={() => setResolving(null)}
          onConfirm={(note) => {
            ops.resolve(resolving.id, note)
            setResolving(null)
          }}
        />
      )}
      {summaryOpen && <EodSummaryDialog onClose={() => setSummaryOpen(false)} />}
    </Stack>
  )
}
