"use client"

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import Link from 'next/link';

import { useSession } from 'next-auth/react';

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

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const LearnerDashboardPage = () => {
    const { lang } = useParams();
    const { data: session } = useSession();
    const { ready, apiGet } = useApi();

    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const learnerName = session?.user?.name || "Learner";

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const data = await apiGet('/user/learner/overview');
                
                if (!cancelled) setOverview(data);
            } catch (err) {
                
                if (!cancelled) setError(err.message);
            } finally {
                
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready]);

    const stats = overview?.stats || {
        enrolledBatches: 0,
        sessionsToday: 0,
        pendingPreReads: 0
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Card elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Chip label="Learner Portal" color="primary" size="small" sx={{ fontWeight: 600, mb: 1, borderRadius: '8px' }} />
                        <Typography variant="h4" fontWeight="700">Welcome back, {learnerName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Track your sessions, pre-reads, and assignments across all enrolled batches.
                        </Typography>
                    </Card>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card
                                component={Link}
                                href={`/${lang}/apps/ilt-module/batch-list`}
                                elevation={0}
                                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'block', textDecoration: 'none', color: 'inherit', '&:hover': { borderColor: 'primary.main' } }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', borderRadius: 2 }}>
                                        <i className="tabler-books text-2xl" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>My Batches</Typography>
                                        {loading ? <Skeleton width={40} /> : <Typography variant="h5" fontWeight="700">{stats.enrolledBatches}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                        {/* // LearnerDashboardPage.jsx — add a 4th stat card, or a button near "View My Batches" */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card
                                component={Link}
                                href={`/${lang}/apps/ilt-module/enrollment`}
                                elevation={0}
                                sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'block', textDecoration: 'none', color: 'inherit', '&:hover': { borderColor: 'primary.main' } }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', borderRadius: 2 }}>
                                        <i className="tabler-clipboard-check text-2xl" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>My Enrollments</Typography>
                                        <Typography variant="body2" color="text.secondary">Respond to nominations</Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'info.main', borderRadius: 2 }}>
                                        <i className="tabler-calendar" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Sessions Today</Typography>
                                        {loading ? <Skeleton width={40} /> : <Typography variant="h5" fontWeight="700">{stats.sessionsToday}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', borderRadius: 2 }}>
                                        <i className="tabler-book text-2xl" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Pending Pre-reads</Typography>
                                        {loading ? <Skeleton width={40} /> : <Typography variant="h5" fontWeight="700">{stats.pendingPreReads}</Typography>}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
                        <Button
                            component={Link}
                            href={`/${lang}/apps/ilt-module/batch-list`}
                            variant="contained"
                            endIcon={<i className="tabler-arrow-right text-lg" />}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            View My Batches
                        </Button>
                    </Box>

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerDashboardPage;
