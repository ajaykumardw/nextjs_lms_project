"use client";

import React, { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import {
    Box,
    Card,
    Typography,
    TextField,
    MenuItem,
    Chip,
    Avatar,
    Button,
    InputAdornment,
    LinearProgress,
    Skeleton,
    Alert,
    Pagination,
    Stack
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { useApi } from "@/hooks/useApi";

const ITEMS_PER_PAGE = 6;

const useDebouncedValue = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        
        return () => clearTimeout(t);
    }, [value, delay]);
    
    return debounced;
};

const LearnerRosterPage = () => {
    const router = useRouter();

    const { bId, sId, lang } = useParams();
    const { ready, apiGet } = useApi();

    const batchId = bId;
    const sessionId = sId;

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const debouncedSearch = useDebouncedValue(search);

    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!ready || !batchId || !sessionId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const qs = new URLSearchParams({ search: debouncedSearch, status }).toString();
                const data = await apiGet(`/user/trainer/batches/${batchId}/sessions/${sessionId}/learners?${qs}`);
                
                if (!cancelled) {
                    setLearners(data.learners || []);
                    setPage(1); // Reset page on filter/search change
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId, sessionId, debouncedSearch, status]);

    const total = learners.length;
    const present = learners.filter((l) => l.attendance >= 1).length;
    const atRisk = learners.filter((l) => l.status === "At Risk").length;
    const avgAttendance = total ? Math.round(learners.reduce((s, l) => s + l.attendance, 0) / total) : 0;

    // Pagination calculations
    const totalPages = Math.ceil(learners.length / ITEMS_PER_PAGE);
    
    const paginatedLearners = learners.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handlePageChange = (_, value) => {
        setPage(value);
    };

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
            <Box sx={{ maxWidth: 1500, mx: "auto" }}>

                <Button
                    variant="outlined"
                    startIcon={<i className="tabler-arrow-left" />}
                    onClick={() => router.push(`/${lang}/apps/batch-session/batches/${batchId}/sessions/${sessionId}/attendance`)}
                    sx={{
                        mb: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: 'divider',
                        color: 'text.primary',
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }
                    }}
                >
                    Back to Attendance
                </Button>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight={700}>Session Learners</Typography>
                </Box>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Stat title="Total Learners" value={total} />
                    <Stat title="Present" value={present} />
                    <Stat title="Attendance %" value={`${avgAttendance}%`} />
                    <Stat title="At Risk" value={atRisk} />
                </Grid>

                {/* Filters */}
                {/* Filters */}
                <Card elevation={0} sx={{ p: 2.5, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: 'background.paper' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                id="learner-search-input" // Added explicit ID to prevent SSR mismatch
                                fullWidth
                                size="small"
                                placeholder="Search learner, employee ID or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="tabler-search" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                id="learner-status-select" // Added explicit ID to prevent SSR mismatch
                                select
                                fullWidth
                                size="small"
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="At Risk">At Risk</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Card>

                {/* Learner cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {loading && [1, 2, 3, 4, 5, 6].map((n) => (
                        <Grid size={{ xs: 12, md: 6, xl: 4 }} key={n}>
                            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}

                    {!loading && learners.length === 0 && (
                        <Grid size={12}>
                            <Card elevation={0} sx={{ p: 6, textAlign: 'center', border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                                <Typography variant="body1" color="text.secondary">No learners match your filters.</Typography>
                            </Card>
                        </Grid>
                    )}

                    {!loading && paginatedLearners.map((learner) => (
                        <Grid size={{ xs: 12, md: 6, xl: 4 }} key={learner.id}>
                            <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', color: "white", fontWeight: 600 }}>{learner.name?.charAt(0)}</Avatar>

                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={700}>{learner.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{learner.employeeId}</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip
                                                    label={learner.status}
                                                    size="small"
                                                    color={learner.status === "At Risk" ? "warning" : "success"}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">{learner.email}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{learner.department}</Typography>

                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">Attendance</Typography>
                                            <Typography variant="caption" fontWeight={700}>{learner.attendance}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={learner.attendance} sx={{ height: 6, borderRadius: 5 }} />
                                    </Box>
                                </Box>

                                <Button fullWidth variant="outlined" sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
                                    View Learner
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination Controls */}
                {!loading && (
                    <Card elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: 'background.paper' }}>
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Pagination
                                count={totalPages > 0 ? totalPages : 1}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Stack>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

const Stat = ({ title, value }) => (
    <Grid size={{ xs: 6, md: 3 }}>
        <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="">{title}</Typography>
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Card>
    </Grid>
);

export default LearnerRosterPage;
