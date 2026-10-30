import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useEditorState } from '@tiptap/react'
import TitleRoundedIcon from '@mui/icons-material/TitleRounded'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import { insertImageFiles } from '../report/keyImages.js'
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded'
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded'
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded'
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded'
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded'
import UndoRoundedIcon from '@mui/icons-material/UndoRounded'
import RedoRoundedIcon from '@mui/icons-material/RedoRounded'
import { authorColors } from '../theme.js'

function AuthorshipToggle({ on, onToggle }) {
  return (
    <Tooltip
      title={
        <Stack spacing={0.5} sx={{ py: 0.25 }}>
          <span>Show who wrote what in the report:</span>
          <span>Violet tint: AI-drafted text · Green tint: your text</span>
          <span>(Points still to review are always tinted.)</span>
        </Stack>
      }
    >
      <Box
        component="button"
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          height: 30,
          px: 1,
          borderRadius: 2,
          cursor: 'pointer',
          font: 'inherit',
          border: '1px solid',
          borderColor: on ? '#ddd6fe' : 'divider',
          bgcolor: on ? '#faf8ff' : 'background.paper',
          color: 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        <Box sx={{ width: 3, height: 14, borderRadius: 1, bgcolor: on ? authorColors.ai.bar : '#B9CFCD' }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 650, color: on ? '#5b21b6' : 'text.secondary' }}>AI</Typography>
        <Box
          sx={{
            px: 0.5,
            borderRadius: 0.75,
            fontSize: '0.72rem',
            fontWeight: 650,
            bgcolor: on ? authorColors.reviewer.tint : '#EEF5F4',
            color: on ? authorColors.reviewer.text : 'text.secondary',
          }}
        >
          You
        </Box>
      </Box>
    </Tooltip>
  )
}

export default function EditorToolbar({ editor, disabled, showAuthorship, onToggleAuthorship, children }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) =>
      ed
        ? {
            bold: ed.isActive('bold'),
            italic: ed.isActive('italic'),
            underline: ed.isActive('underline'),
            heading: ed.isActive('heading'),
            bulletList: ed.isActive('bulletList'),
            orderedList: ed.isActive('orderedList'),
            table: ed.isActive('table'),
            canUndo: ed.can().undo(),
            canRedo: ed.can().redo(),
          }
        : null,
  })

  const off = disabled || !editor || !state
  const tools = [
    { key: 'heading', label: 'Section heading', icon: <TitleRoundedIcon />, run: (c) => c.toggleHeading({ level: 3 }) },
    { key: 'bold', label: 'Bold (Ctrl+B)', icon: <FormatBoldRoundedIcon />, run: (c) => c.toggleBold() },
    { key: 'italic', label: 'Italic (Ctrl+I)', icon: <FormatItalicRoundedIcon />, run: (c) => c.toggleItalic() },
    { key: 'underline', label: 'Underline (Ctrl+U)', icon: <FormatUnderlinedRoundedIcon />, run: (c) => c.toggleUnderline() },
    'divider',
    { key: 'bulletList', label: 'Bulleted list', icon: <FormatListBulletedRoundedIcon />, run: (c) => c.toggleBulletList() },
    { key: 'orderedList', label: 'Numbered list', icon: <FormatListNumberedRoundedIcon />, run: (c) => c.toggleOrderedList() },
    'divider',
    { key: 'image', label: 'Insert image from computer (or drag key images from the viewer)', icon: <AddPhotoAlternateOutlinedIcon />, upload: true },
    {
      key: 'table',
      label: 'Insert table (measurements)',
      icon: <TableChartOutlinedIcon />,
      run: (c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    },
    'divider',
    { key: 'undo', label: 'Undo (Ctrl+Z)', icon: <UndoRoundedIcon />, run: (c) => c.undo(), enabled: state && state.canUndo },
    { key: 'redo', label: 'Redo (Ctrl+Y)', icon: <RedoRoundedIcon />, run: (c) => c.redo(), enabled: state && state.canRedo },
  ]

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', px: 1, height: 46, flexShrink: 0, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', gap: 0.25 }}
    >
      {tools.map((tool, i) =>
        tool === 'divider' ? (
          <Divider key={`d${i}`} orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.25 }} />
        ) : (
          <Tooltip key={tool.key} title={tool.label}>
            <span>
              <IconButton
                size="small"
                component={tool.upload ? 'label' : 'button'}
                disabled={off || tool.enabled === false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={tool.upload ? undefined : () => tool.run(editor.chain().focus()).run()}
                sx={{
                  width: 30,
                  height: 30,
                  color: state && state[tool.key] ? 'primary.main' : '#5B6B7F',
                  bgcolor: state && state[tool.key] ? 'primary.light' : 'transparent',
                  '& svg': { fontSize: 19 },
                }}
              >
                {tool.icon}
                {tool.upload && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      if (editor && e.target.files.length) insertImageFiles(editor, e.target.files)
                      e.target.value = ''
                    }}
                  />
                )}
              </IconButton>
            </span>
          </Tooltip>
        ),
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 1.25 }} />
      <AuthorshipToggle on={showAuthorship} onToggle={onToggleAuthorship} />
      <Box sx={{ flex: 1, minWidth: 8 }} />
      {children}
    </Stack>
  )
}
