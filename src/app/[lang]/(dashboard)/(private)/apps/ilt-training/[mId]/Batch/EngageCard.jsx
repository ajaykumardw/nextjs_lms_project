import { Box, Card, CardContent, Typography } from "@mui/material";

const EngageCard = ({ title, subtitle, runtime, rightInfo }) => (
    <Card variant="outlined" sx={{ height: 140 }}>
        <CardContent
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Box>
                <Typography fontWeight={600} variant="body1" gutterBottom>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Box display="flex" justifyContent="flex-end">
                {runtime && (
                    <Typography variant="body2" color="text.secondary">
                        {runtime}
                    </Typography>
                )}
                {rightInfo && <Box textAlign="right">{rightInfo}</Box>}
            </Box>
        </CardContent>
    </Card>
);

export default EngageCard
