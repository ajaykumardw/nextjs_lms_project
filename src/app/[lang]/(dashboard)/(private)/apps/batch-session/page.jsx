"use client"

import React, { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useParams } from 'next/navigation';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Chip,
    Avatar,
    Skeleton,
    Alert
} from '@mui/material';

import Grid from "@mui/material/Grid2";

import Link from 'next/link';
import PermissionGuard from '@/hocs/PermissionClientGuard';
import { useApi } from '@/hooks/useApi';

const TrainerOverviewPage = () => {

    const { lang } = useParams();
    const { data: session } = useSession();
    const { ready, apiGet } = useApi();

    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const trainerName = session?.user?.name || "Trainer";

    useEffect(() => {
        if (!ready) return;

        let cancelled = false;

        const fetchOverview = async () => {
            try {
                setLoading(true);
                const data = await apiGet(`/user/trainer/overview`);
                if (!cancelled) setOverview(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchOverview();

        return () => { cancelled = true; };
    }, [ready]);

    const stats = overview?.stats || {
        activeBatches: 0,
        upcomingSessionsToday: 0,
        totalLearnersEnrolled: 0,
        pendingGrading: 0
    };
    const todaySessions = overview?.todaySessions || [];

    return (
        <PermissionGuard element={"isUser"} locale={lang}>

            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    {/* Welcome Header */}
                    <Card elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Chip label="Enterprise Trainer Portal" color="primary" size="small" sx={{ fontWeight: 600, mb: 1, borderRadius: '8px' }} />
                                <Typography variant="h4" fontWeight="700">
                                    Welcome back,{' '}
                                    <Box
                                        component={Link}
                                        href={`/${lang}/apps/batch-session/trainer-profile`}
                                        sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        {trainerName}
                                    </Box>{' '}
                                    🎓
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    You are managing programs across massive learner cohorts. Select a section below to view paginated batches, materials, and attendance rosters.
                                </Typography>
                            </Box>
                        </Box>
                    </Card>

                    {/* Overview Metrics */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', borderRadius: 2 }}>
                                        <i className="tabler-calendar text-2xl" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Sessions Today</Typography>
                                        {loading ? <Skeleton width={40} /> : <Typography variant="h5" fontWeight="700">{stats.upcomingSessionsToday}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card
                                component={Link}
                                href={`/${lang}/apps/batch-session/batches`}
                                elevation={0}
                                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'block', textDecoration: 'none', color: 'inherit', '&:hover': { borderColor: 'primary.main' } }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'info.main', borderRadius: 2 }}>
                                        <i className="tabler-clock" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Active ILT Batches</Typography>
                                        {loading ? <Skeleton width={40} /> : <Typography variant="h5" fontWeight="700">{stats.activeBatches}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', borderRadius: 2 }}>
                                        <i className="tabler-users text-2xl" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Learners</Typography>
                                        {loading ? <Skeleton width={60} /> : <Typography variant="h5" fontWeight="700">{stats.totalLearnersEnrolled.toLocaleString()}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card
                                component={Link}
                                href={`/${lang}/apps/batch-session/resource/grading`}
                                elevation={0}
                                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'block', textDecoration: 'none', color: 'inherit', '&:hover': { borderColor: 'warning.main' } }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', borderRadius: 2 }}>
                                        <i className="tabler-file-text text-2xl" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Pending Grading</Typography>
                                        {loading ? <Skeleton width={40} /> : <Typography variant="h5" fontWeight="700">{stats.pendingGrading}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Quick Navigation Cards */}
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Today's Teaching Schedule</Typography>

                                {loading && <Skeleton variant="rounded" height={90} />}

                                {!loading && todaySessions.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No sessions scheduled for today.</Typography>
                                )}

                                {todaySessions.map((sess) => (
                                    <Box key={sess.id} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <Chip
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/batches/${sess.batchId}`}
                                                label={sess.batchName}
                                                size="small"
                                                color="primary"
                                                clickable
                                                sx={{ mb: 1 }}
                                            />
                                            <Typography variant="subtitle1" fontWeight="700">{sess.sessionTitle}</Typography>
                                            <Typography variant="caption" color="text.secondary">🕒 {sess.time} | 📍 {sess.room}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/resource/pre-read?batchId=${sess.batchId}&sessionId=${sess.id}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Pre-read
                                            </Button>
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/batches/${sess.batchId}/sessions/${sess.id}/attendance`}
                                                variant="contained"
                                                endIcon={<i className="tabler-arrow-right text-lg" />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Open Session
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>Batch Management</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Access all assigned batches, view cohort breakdowns, filter learners, and manage materials per batch.
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Button
                                        component={Link}
                                        href={`/${lang}/apps/batch-session/batches`}
                                        variant="outlined"
                                        fullWidth
                                        size="large"
                                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                                    >
                                        View All Batches {loading ? '' : `(${stats.activeBatches})`}
                                    </Button>
                                    <Button
                                        component={Link}
                                        href={`/${lang}/apps/batch-session/resource/grading`}
                                        variant="text"
                                        fullWidth
                                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                                    >
                                        Go to Grading Queue
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>

                </Container>
            </Box>

        </PermissionGuard>
    );
};

export default TrainerOverviewPage;
