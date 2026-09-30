import { Card, CardContent, Typography, Avatar, Stack } from "@mui/material";

import { alpha } from "@mui/material/styles";

// color: a palette key ("primary" | "success" | "error" | "warning" | "info")
// so the card follows the theme (light/dark) instead of hardcoded hex values.
export default function StatsCard({ title, value, icon, color = "primary" }) {

    const display = typeof value === "number" ? value.toLocaleString() : value;

    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 48,
                            height: 48,
                            bgcolor: (t) => alpha(t.palette[color].main, 0.16),
                            color: `${color}.main`,
                        }}
                    >
                        <i className={icon} style={{ fontSize: 26 }} />
                    </Avatar>

                    <div style={{ minWidth: 0 }}>
                        <Typography color="text.secondary" variant="body2" noWrap title={title}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {display}
                        </Typography>
                    </div>
                </Stack>
            </CardContent>
        </Card>
    );
}
