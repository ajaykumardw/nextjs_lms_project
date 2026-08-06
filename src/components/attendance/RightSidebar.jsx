"use client";

import {
    Card,
    CardContent,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Switch,
    Box,
} from "@mui/material";

export default function RightSidebar() {
    const quickLinks = [
        {
            title: "Individual Report",
            icon: "tabler-file-text",
        },
        {
            title: "Batch Report",
            icon: "tabler-report",
        },
        {
            title: "Department Report",
            icon: "tabler-building-community",
        },
        {
            title: "Trainer Report",
            icon: "tabler-user-star",
        },
    ];

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {/* Quick Links */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Quick Links
                    </Typography>

                    <List disablePadding>
                        {quickLinks.map((item) => (
                            <ListItemButton
                                key={item.title}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <i
                                        className={item.icon}
                                        style={{
                                            fontSize: 22,
                                            color: "#5E81F4",
                                        }}
                                    />
                                </ListItemIcon>

                                <ListItemText primary={item.title} />

                                <i
                                    className="tabler-chevron-right"
                                    style={{
                                        fontSize: 18,
                                        color: "#9e9e9e",
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Notifications
                    </Typography>

                    <List disablePadding>
                        <ListItemButton sx={{ borderRadius: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <i
                                    className="tabler-bell"
                                    style={{
                                        fontSize: 22,
                                        color: "#5E81F4",
                                    }}
                                />
                            </ListItemIcon>

                            <ListItemText primary="Reminders" />

                            <Switch defaultChecked />
                        </ListItemButton>

                        <ListItemButton sx={{ borderRadius: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <i
                                    className="tabler-bell-off"
                                    style={{
                                        fontSize: 22,
                                        color: "#5E81F4",
                                    }}
                                />
                            </ListItemIcon>

                            <ListItemText primary="Absence Alerts" />

                            <Switch />
                        </ListItemButton>
                    </List>
                </CardContent>
            </Card>

            {/* Attendance Rules */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Attendance Rules
                    </Typography>

                    <Box
                        component="ul"
                        sx={{
                            pl: 2.5,
                            m: 0,
                            "& li": {
                                mb: 1.5,
                            },
                        }}
                    >
                        <li>
                            <Typography variant="body2">
                                Minimum attendance requirement is <strong>80%</strong>.
                            </Typography>
                        </li>

                        <li>
                            <Typography variant="body2">
                                Late arrivals are marked after the grace period.
                            </Typography>
                        </li>

                        <li>
                            <Typography variant="body2">
                                Online sessions support automatic attendance.
                            </Typography>
                        </li>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
