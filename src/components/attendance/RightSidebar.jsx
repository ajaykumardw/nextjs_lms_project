"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";

const RULES = [
    <>Minimum attendance requirement is <strong>80%</strong>.</>,
    "Late arrivals are marked after the grace period.",
    "Online sessions support automatic attendance.",
];

export default function RightSidebar() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                    Attendance rules
                </Typography>

                <Box component="ul" sx={{ pl: 2.5, m: 0, "& li": { mb: 1.5 }, "& li:last-of-type": { mb: 0 } }}>
                    {RULES.map((rule, i) => (
                        <li key={i}>
                            <Typography variant="body2">{rule}</Typography>
                        </li>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
