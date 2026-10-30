import { useState } from 'react'
import { Box } from '@mui/material'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { roiFraction, wadoUrl } from '../report/format.js'

export default function RoiThumbnail({ source, roi, size = 84, compact = false }) {
  const [failed, setFailed] = useState(false)
  const [natural, setNatural] = useState(null)
  const r = natural ? roiFraction(roi, natural.width, natural.height) : null
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
        <Box
          sx={{
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: natural ? `${natural.width} / ${natural.height}` : '1 / 1',
            width: natural && natural.width >= natural.height ? '100%' : 'auto',
            height: natural && natural.width < natural.height ? '100%' : 'auto',
          }}
        >
          <img
            src={wadoUrl(source)}
            alt={`Series ${source.seriesNumber}, image ${source.instanceNumber}`}
            onError={() => setFailed(true)}
            onLoad={(e) => setNatural({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          {r && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {r.shape === 'ellipse' ? (
                <ellipse cx={(r.x + r.width / 2) * 100} cy={(r.y + r.height / 2) * 100} rx={(r.width / 2) * 100} ry={(r.height / 2) * 100} {...stroke} />
              ) : (
                <rect x={r.x * 100} y={r.y * 100} width={r.width * 100} height={r.height * 100} {...stroke} />
              )}
            </svg>
          )}
        </Box>
      )}
    </Box>
  )
}
