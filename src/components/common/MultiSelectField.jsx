import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from '@mui/material'
import { typography } from '../../styles/tokens.js'

// Multi-select dropdown with checkboxes. options: [{ value, label }]. Empty selection means "any".
export default function MultiSelectField({ id, label, options, value, onChange, anyLabel }) {
  const labelOf = Object.fromEntries(options.map((o) => [o.value, o.label]))
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id={`${id}-label`} shrink>
        {label}
      </InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        multiple
        displayEmpty
        value={value}
        onChange={(e) => onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
        input={<OutlinedInput label={label} notched />}
        renderValue={(selected) => (selected.length ? selected.map((v) => labelOf[v] || v).join(', ') : anyLabel)}
        MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
        sx={{ fontSize: typography.size.sm, bgcolor: 'background.paper' }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} dense>
            <Checkbox size="small" checked={value.includes(o.value)} sx={{ p: 0.5, mr: 1 }} />
            <ListItemText primary={o.label} slotProps={{ primary: { sx: { fontSize: typography.size.sm } } }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
