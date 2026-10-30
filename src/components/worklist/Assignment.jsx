import { useState } from 'react'
import { Avatar, CircularProgress, Divider, IconButton, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { isFinalized } from '../../worklist/reviewWorkflow.js'
import { brand, colors, typography } from '../../styles/tokens.js'

export function AssigneeLabel({ radiologist, isCurrentUser }) {
  const { t } = useI18n()
  if (!radiologist) {
    return <Typography sx={{ fontSize: typography.size.sm, color: colors.text.muted, fontStyle: 'italic' }}>{t('assignment.unassigned')}</Typography>
  }
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Avatar
        sx={{
          width: 24,
          height: 24,
          flexShrink: 0,
          fontSize: typography.size.xxs,
          fontWeight: typography.weight.bold,
          bgcolor: isCurrentUser ? brand.oceanTeal : colors.neutral.light,
          color: isCurrentUser ? colors.text.inverse : colors.neutral.dark,
        }}
      >
        {radiologist.initials}
      </Avatar>
      <Typography noWrap title={radiologist.name} sx={{ fontSize: typography.size.sm, fontWeight: isCurrentUser ? typography.weight.semibold : typography.weight.regular }}>
        {isCurrentUser ? t('assignment.you') : radiologist.name}
      </Typography>
    </Stack>
  )
}

// Kebab menu: assign to me / to a colleague / unassign. Calls onAssign(radiologistId | null).
export function AssignMenu({ study, radiologists, currentUserId, busy, onAssign }) {
  const { t } = useI18n()
  const [anchor, setAnchor] = useState(null)
  const completed = isFinalized(study)
  const choose = (id) => {
    setAnchor(null)
    onAssign(id)
  }

  if (busy) return <CircularProgress size={18} sx={{ m: 0.75 }} aria-label={t('common.saving')} />

  return (
    <>
      <Tooltip title={completed ? t('assignment.lockedCompleted') : t('assignment.menu')}>
        <span>
          <IconButton
            size="small"
            disabled={completed}
            aria-label={t('assignment.menu')}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation()
              setAnchor(e.currentTarget)
            }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 240 } } }}
      >
        {study.assignedTo !== currentUserId && (
          <MenuItem onClick={() => choose(currentUserId)}>
            <ListItemIcon>
              <PersonAddAlt1RoundedIcon fontSize="small" sx={{ color: brand.oceanTeal }} />
            </ListItemIcon>
            <ListItemText primary={t('assignment.assignToMe')} />
          </MenuItem>
        )}
        <ListSubheader sx={{ lineHeight: '32px', fontSize: typography.size.xs }}>{t('assignment.assignTo')}</ListSubheader>
        {radiologists.map((r) => (
          <MenuItem key={r.id} dense selected={study.assignedTo === r.id} onClick={() => choose(r.id)}>
            <ListItemIcon>{study.assignedTo === r.id && <CheckRoundedIcon fontSize="small" />}</ListItemIcon>
            <ListItemText primary={r.name} secondary={r.subspecialty} />
          </MenuItem>
        ))}
        {study.assignedTo && <Divider />}
        {study.assignedTo && (
          <MenuItem onClick={() => choose(null)}>
            <ListItemIcon>
              <PersonRemoveRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('assignment.unassign')} />
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
