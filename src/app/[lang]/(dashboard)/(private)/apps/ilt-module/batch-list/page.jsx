"use client"

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import Link from 'next/link';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Chip,
    LinearProgress,
    Skeleton,
    Alert
} from '@mui/material';

import Grid from "@mui/material/Grid2";

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const LearnerBatchesListPage = () => {
    const { lang } = useParams();
    const { ready, apiGet } = useApi();

    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const data = await apiGet('/user/learner/batches');
                
                if (!cancelled) setBatches(data.batches || []);
            } catch (err) {
                
                if (!cancelled) setError(err.message);
            } finally {
                
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready]);

    return (
        <PermissionGuard element={"isUser"} locale={lang}>
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box sx={{ mb: 4 }}>
                        <Button
                            component={Link}
                            variant="outlined"
                            href={`/${lang}/apps/ilt-module`}
                            startIcon={<i className="tabler-arrow-left text-lg" />}
                            sx={{ textTransform: 'none', mb: 1, fontWeight: 600 }}
                        >
                            Back to Dashboard
                        </Button>
                        <Typography variant="h4" fontWeight="700">My Batches</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Batches you are enrolled in, with your pre-read and attendance progress.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {loading && [1, 2, 3].map((n) => (
                            <Grid size={{ xs: 12, md: 4 }} key={n}>
                                <Skeleton variant="rounded" height={200} />
                            </Grid>
                        ))}

                        {!loading && batches.length === 0 && (
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary">You are not enrolled in any batches yet.</Typography>
                            </Grid>
                        )}

                        {!loading && batches.map((batch) => (
                            <Grid size={{ xs: 12, md: 4 }} key={batch.id}>
                                <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Chip
                                            label={batch.status}
                                            size="small"
                                            color={batch.status === 'in_progress' || batch.status === 'open' ? 'success' : 'default'}
                                            variant="outlined"
                                            sx={{ mb: 2 }}
                                        />
                                        <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>{batch.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{batch.venue}</Typography>

                                        <Box sx={{ mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">Attendance</Typography>
                                                <Typography variant="caption" fontWeight={700}>{batch.attendancePercentage}%</Typography>
                                            </Box>
                                            <LinearProgress variant="determinate" value={batch.attendancePercentage} sx={{ height: 6, borderRadius: 5 }} />
                                        </Box>
                                    </Box>

                                    <Button
                                        component={Link}
                                        href={`/${lang}/apps/ilt-module/batch-session/${batch.id}`}
                                        variant="contained"
                                        fullWidth
                                        endIcon={<i className="tabler-arrow-right text-lg" />}
                                        sx={{ textTransform: 'none', borderRadius: 2, mt: 2 }}
                                    >
                                        View Sessions
                                    </Button>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerBatchesListPage;
