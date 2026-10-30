import { Box } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { brand, radius } from '../../styles/tokens.js'

// SEE BETTER logo tile (eye on teal). Used in the sign-in screen and the app bar.
export default function BrandMark({ size = 32, sx }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${size >= 40 ? radius.lg - 2 : radius.md}px`,
        display: 'grid',
        placeItems: 'center',
        color: brand.mintWhite,
        background: `linear-gradient(145deg, #14B8A6, ${brand.oceanTeal})`,
        border: `1px solid ${brand.softAqua}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        '& svg': { fontSize: size * 0.56 },
        ...sx,
      }}
    >
      <VisibilityOutlinedIcon />
    </Box>
  )
}
