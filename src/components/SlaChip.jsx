import { useEffect, useState } from 'react'
import { Box, ListSubheader, Menu, MenuItem, Typography } from '@mui/material'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { chrome } from '../theme.js'

const OPTIONS = [15, 30, 60, 120]

function describe(sla, now) {
  if (!sla || !sla.dueAt) return { label: 'Set deadline', tone: 'none' }
  const minutes = Math.round((new Date(sla.dueAt).getTime() - now) / 60000)
  if (sla.overdueAt || minutes < 0) return { label: `Overdue ${Math.abs(minutes)} min`, tone: 'late' }
  if (minutes < 60) return { label: `Due in ${minutes} min`, tone: minutes <= 10 ? 'soon' : 'ok' }
  return { label: `Due in ${Math.floor(minutes / 60)} h ${minutes % 60} min`, tone: 'ok' }
}

const TONE = {
  none: { color: chrome.muted, border: '#2b3852', bg: 'transparent' },
  ok: { color: '#cbd5e1', border: '#2b3852', bg: 'transparent' },
  soon: { color: '#fcd34d', border: '#6b5310', bg: 'rgba(251,191,36,0.1)' },
  late: { color: '#fca5a5', border: '#7f1d1d', bg: 'rgba(239,68,68,0.14)' },
}

export default function SlaChip({ sla, disabled, onSet }) {
  const [anchor, setAnchor] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const { label, tone } = describe(sla, now)
  const style = TONE[tone]

  return (
    <>
      <Box
        component="button"
        type="button"
        disabled={disabled}
        onClick={(e) => setAnchor(e.currentTarget)}
        title="Report deadline"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          height: 30,
          px: 1,
          borderRadius: 2,
          border: `1px solid ${style.border}`,
          bgcolor: style.bg,
          color: style.color,
          font: 'inherit',
          fontSize: '0.74rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      >
        <TimerOutlinedIcon sx={{ fontSize: 16 }} />
        {label}
      </Box>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <ListSubheader sx={{ lineHeight: '32px', fontSize: '0.72rem' }}>Report due in</ListSubheader>
        {OPTIONS.map((minutes) => (
          <MenuItem
            key={minutes}
            onClick={() => {
              setAnchor(null)
              onSet(minutes)
            }}
          >
            <Typography sx={{ fontSize: '0.84rem' }}>{minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes > 60 ? 's' : ''}`}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
