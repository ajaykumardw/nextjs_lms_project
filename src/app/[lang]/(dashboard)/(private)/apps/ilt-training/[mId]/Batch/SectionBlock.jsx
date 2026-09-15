import { Box, Typography } from "@mui/material";

const SectionBlock = ({ title, description, children }) => (
    <Box mb={5}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
        </Typography>
        {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
            </Typography>
        )}
        <Box>{children}</Box>
    </Box>
);

export default SectionBlock
