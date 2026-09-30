"use client";


import { useEffect, useRef, useState } from "react";

import { Box, Card, Typography } from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";

const CHART_HEIGHT = 300;

const formatDay = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export default function AttendanceChart({ trend = [], attendanceRate = 0, pending = 0 }) {

    const wrapRef = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const el = wrapRef.current;
        
        if (!el) return;

        setWidth(Math.floor(el.getBoundingClientRect().width));

        const ro = new ResizeObserver(([entry]) => {

            setWidth(Math.floor(entry.contentRect.width));
        });
        
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    const hasData = trend.length > 0;

    return (
        <Card sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={1} mb={2}>
                <Typography variant="h6" fontWeight={700}>
                    Attendance trend
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Overall: <strong>{attendanceRate}%</strong>
                    {pending > 0 && ` · ${pending} pending`}
                </Typography>
            </Box>

            {/* Always rendered, so the ref exists and width is known before the chart mounts */}
            <Box ref={wrapRef} sx={{ width: "100%", minWidth: 0, height: CHART_HEIGHT }}>
                {!hasData ? (
                    <Box
                        height="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        color="text.secondary"
                    >
                        No attendance has been marked for this period.
                    </Box>
                ) : (
                    width > 0 && (
                        <LineChart
                            width={width}
                            height={CHART_HEIGHT}
                            xAxis={[
                                {
                                    scaleType: "point",
                                    data: trend.map((t) => formatDay(t.date)),
                                    
                                    // keep labels readable when there are many days
                                    tickLabelInterval: (_, i) =>
                                        trend.length <= 10 || i % Math.ceil(trend.length / 10) === 0,
                                },
                            ]}
                            yAxis={[{ min: 0, max: 100, valueFormatter: (v) => `${v}%` }]}
                            series={[
                                {
                                    data: trend.map((t) => t.rate),
                                    label: "Attendance %",
                                    valueFormatter: (v) => (v == null ? "-" : `${v}%`),
                                    showMark: trend.length <= 31,
                                },
                            ]}
                            grid={{ horizontal: true }}
                            slotProps={{ legend: { hidden: true } }}
                        />
                    )
                )}
            </Box>
        </Card>
    );
}
