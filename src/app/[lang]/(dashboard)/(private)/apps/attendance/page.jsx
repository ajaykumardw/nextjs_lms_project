"use client";

import { useEffect, useState, useCallback } from "react";

import { useSession } from "next-auth/react";

import { Alert, Box, LinearProgress } from "@mui/material";

import Grid from "@mui/material/Grid2";

import Header from "@components/attendance/Header";
import StatsCard from "@components/attendance/StatsCard";
import AttendanceChart from "@components/attendance/AttendanceChart";
import AttendanceTable from "@components/attendance/AttendanceTable";
import RightSidebar from "@components/attendance/RightSidebar";
import { fetchAttendanceDashboard } from "@services/attendanceService";
import { RANGE_LABELS } from "@components/attendance/constants";

const EMPTY = {
    stats: { totalLearners: 0, present: 0, absent: 0, late: 0, pending: 0, attendanceRate: 0 },
    trend: [],
    logs: { items: [], page: 1, limit: 10, total: 0, totalPages: 0 },
    batches: [],
};

export default function AttendancePage() {

    const { data: session, status: sessionStatus } = useSession();

    const token = session?.user?.token;

    // `search` here is the debounced value that actually drives the API call.
    const [filters, setFilters] = useState({
        range: "today",
        batch_id: "all",
        status: "all",
        search: "",
        page: 1,
        limit: 10,
    });
    
    // what the user is typing (updates instantly, so the input never lags)
    
    const [searchInput, setSearchInput] = useState("");
    const [data, setData] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Debounce typing -> filters.search. Doing it here (and resetting page in the
    // same update) avoids the double request the old version fired.
    useEffect(() => {

        const t = setTimeout(() => {

            setFilters((prev) =>
                prev.search === searchInput.trim() ? prev : { ...prev, search: searchInput.trim(), page: 1 }
            );
        }, 400);

        return () => clearTimeout(t);
    }, [searchInput]);

    // Any filter change other than page resets to page 1
    const updateFilters = useCallback((patch) => {

        setFilters((prev) => ({ ...prev, page: 1, ...patch }));
    }, []);

    const handleHeaderChange = useCallback(

        (patch) => {

            if ("search" in patch) setSearchInput(patch.search);

            else updateFilters(patch);
        },
        [updateFilters]
    );

    useEffect(() => {
        if (sessionStatus === "loading") return;

        if (!token) {

            setLoading(false);

            setError("You are signed out. Sign in again to view attendance.");

            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                
                setLoading(true);
                setError("");
                
                const result = await fetchAttendanceDashboard(filters, controller.signal, token);

                // merge one level deep so a partial response can't crash the cards
                
                setData({
                    stats: { ...EMPTY.stats, ...result?.stats },
                    trend: result?.trend ?? [],
                    logs: { ...EMPTY.logs, ...result?.logs },
                    batches: result?.batches ?? [],
                });
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Could not load attendance.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [token, sessionStatus, filters]);

    const { stats } = data;
    const rangeLabel = RANGE_LABELS[filters.range];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "background.default", minHeight: "100vh" }}>
            <Header
                filters={{ ...filters, search: searchInput }}
                batches={data.batches}
                onChange={handleHeaderChange}
            />

            <Box sx={{ height: 4, mb: 2 }}>{loading && <LinearProgress sx={{ borderRadius: 1 }} />}</Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 9 }} sx={{ minWidth: 0 }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <StatsCard
                                title="Enrolled learners"
                                value={stats.totalLearners}
                                icon="tabler-users"
                                color="primary"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <StatsCard
                                title={`Present · ${rangeLabel}`}
                                value={stats.present}
                                icon="tabler-circle-check"
                                color="success"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <StatsCard
                                title={`Absent · ${rangeLabel}`}
                                value={stats.absent}
                                icon="tabler-x"
                                color="error"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                            <StatsCard
                                title={`Late · ${rangeLabel}`}
                                value={stats.late}
                                icon="tabler-clock-hour-4"
                                color="warning"
                            />
                        </Grid>
                    </Grid>

                    <AttendanceChart
                        trend={data.trend}
                        attendanceRate={stats.attendanceRate}
                        pending={stats.pending}
                    />

                    <Box mt={3}>
                        <AttendanceTable
                            logs={data.logs}
                            status={filters.status}
                            loading={loading}
                            onStatusChange={(status) => updateFilters({ status })}
                            onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                            onLimitChange={(limit) => updateFilters({ limit })}
                        />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 3 }}>
                    <RightSidebar />
                </Grid>
            </Grid>
        </Box>
    );
}
