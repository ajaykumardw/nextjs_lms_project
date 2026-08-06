"use client";

import { Card } from "@mui/material";
import { LineChart } from "@mui/x-charts";

export default function AttendanceChart() {
    return (
        <Card sx={{ p: 2 }}>
            <LineChart
                xAxis={[
                    {
                        scaleType: "point",
                        data: [
                            "Day1",
                            "Day5",
                            "Day7",
                            "Day10",
                            "Day14",
                            "Day17",
                            "Day19",
                            "Day23",
                            "Day28",
                            "Day30",
                        ],
                    },
                ]}
                series={[
                    {
                        data: [55, 40, 60, 50, 68, 58, 71, 61, 84, 59],
                    },
                ]}
                height={300}
            />
        </Card>
    );
}
