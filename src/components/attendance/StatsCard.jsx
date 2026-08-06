import { Card, CardContent, Typography, Avatar, Stack } from "@mui/material";

export default function StatsCard({
    title,
    value,
    icon,
    color,
    bgColor
}) {
    return (
        <Card elevation={2}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: bgColor, color }}>{icon}</Avatar>

                    <div>
                        <Typography color="text.secondary">
                            {title}
                        </Typography>

                        <Typography variant="h4" fontWeight={700}>
                            {value}
                        </Typography>
                    </div>
                </Stack>
            </CardContent>
        </Card>
    );
}
