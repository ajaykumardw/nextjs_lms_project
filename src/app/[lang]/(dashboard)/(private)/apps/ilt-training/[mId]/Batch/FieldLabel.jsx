import { Box, Typography } from "@mui/material"

const FieldLabel = ({ children, required }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {children}
        {required && (
            <Box component="span" sx={{ color: 'error.main' }}>
                {' *'}
            </Box>
        )}
    </Typography>
)

export default FieldLabel
