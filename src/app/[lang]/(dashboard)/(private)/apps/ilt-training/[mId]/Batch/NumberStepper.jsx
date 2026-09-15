import { Box, IconButton, TextField, Typography } from "@mui/material"

const NumberStepper = ({ value, onChange, prefixLabel, suffixLabel }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            px: 2,
            py: 1,
            width: 'fit-content'
        }}
    >
        {prefixLabel && (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                {prefixLabel}
            </Typography>
        )}
        <IconButton
            size="small"
            onClick={() => onChange(Math.max(0, value - 1))}
            sx={{ bgcolor: 'action.hover', borderRadius: 1, width: 28, height: 28 }}
        >
            <i className="tabler-minus" fontSize="inherit" />
        </IconButton>
        <TextField
            size="small"
            value={value}
            onChange={e => {
                const num = parseInt(e.target.value, 10)
                
                onChange(Number.isNaN(num) || num < 0 ? 0 : num)
            }}
            inputProps={{ style: { textAlign: 'center', width: 32 } }}
        />
        <IconButton
            size="small"
            onClick={() => onChange(value + 1)}
            sx={{ bgcolor: 'action.hover', borderRadius: 1, width: 28, height: 28 }}
        >
            <i className="tabler-plus" fontSize="inherit" />
        </IconButton>
        {suffixLabel && (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                {suffixLabel}
            </Typography>
        )}
    </Box>
)

export default NumberStepper
