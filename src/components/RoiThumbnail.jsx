import { useState } from 'react'
import { Box } from '@mui/material'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { wadoUrl } from '../report/format.js'

export default function RoiThumbnail({ source, roi, size = 84, compact = false }) {
  const [failed, setFailed] = useState(false)
  const r = roi
  const stroke = { fill: 'rgba(250,204,21,0.14)', stroke: '#facc15', strokeWidth: compact ? 1.4 : 2, vectorEffect: 'non-scaling-stroke' }

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: compact ? 1 : 1.5,
        overflow: 'hidden',
        bgcolor: '#000',
        outline: compact ? '1px solid #2b3852' : 'none',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {failed ? (
        <ImageNotSupportedOutlinedIcon sx={{ color: '#475569' }} fontSize="small" />
      ) : (
        <img
          src={wadoUrl(source)}
          alt={`Series ${source.seriesNumber}, image ${source.instanceNumber}`}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
      {r && !failed && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {r.shape === 'ellipse' ? (
            <ellipse cx={(r.x + r.width / 2) * 100} cy={(r.y + r.height / 2) * 100} rx={(r.width / 2) * 100} ry={(r.height / 2) * 100} {...stroke} />
          ) : (
            <rect x={r.x * 100} y={r.y * 100} width={r.width * 100} height={r.height * 100} {...stroke} />
          )}
        </svg>
      )}
    </Box>
  )
}
