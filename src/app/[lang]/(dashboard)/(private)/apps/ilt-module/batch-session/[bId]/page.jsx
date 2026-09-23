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
    Divider,
    Skeleton,
    Alert
} from '@mui/material';

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const formatSessionDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const attendanceColor = (status) => ({
    present: 'success',
    late: 'warning',
    absent: 'error',
    pending: 'default',
}[status] || 'default');

const LearnerBatchSessionsPage = () => {
    const params = useParams();
    const batchId = params?.bId;
    const lang = params?.lang;
    const { ready, apiGet } = useApi();

    const [batch, setBatch] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ready || !batchId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const data = await apiGet(`/user/learner/batches/${batchId}`);

                if (!cancelled) {
                    setBatch(data.batch);
                    setSessions(data.sessions || []);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId]);

    return (
        <PermissionGuard element={"isUser"} locale={lang}>
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Button
                        component={Link}
                        variant='outlined'
                        href={`/${lang}/apps/ilt-module/batch-list`}
                        startIcon={<i className="tabler-arrow-left text-lg" />}
                        sx={{ textTransform: 'none', fontWeight: 600, mb: 3 }}
                    >
                        Back to My Batches
                    </Button>

                    {loading ? (
                        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
                    ) : (
                        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>{batch?.name || 'Batch'}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Your sessions, pre-reads, materials, and assignments for this batch.
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {sessions.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                        No sessions scheduled yet.
                                    </Typography>
                                )}

                                {sessions.map((sess) => (
                                    <Box
                                        key={sess.id}
                                        sx={{
                                            p: 3,
                                            borderRadius: 2.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', md: 'center' },
                                            flexDirection: { xs: 'column', md: 'row' },
                                            gap: 2
                                        }}
                                    >
                                        <Box>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle1" fontWeight="700">Session {sess.sessionNumber}</Typography>
                                                <Chip
                                                    label={sess.myAttendanceStatus}
                                                    size="small"
                                                    color={attendanceColor(sess.myAttendanceStatus)}
                                                    variant="outlined"
                                                />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                🗓️ {formatSessionDate(sess.date)} | ⏰ {sess.startTime} - {sess.endTime}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/ilt-module/resources/pre-read?batchId=${batchId}&sessionId=${sess.id}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Pre-read
                                            </Button>
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/ilt-module/resources/training-material?batchId=${batchId}&sessionId=${sess.id}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Materials
                                            </Button>
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/ilt-module/resources/post-read?batchId=${batchId}&sessionId=${sess.id}`}
                                                variant="contained"
                                                size="small"
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Assignment
                                            </Button>
                                            {/* // LearnerBatchSessionsPage.jsx — add near the "Back to My Batches" button */}
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/ilt-module/batch-session/${batchId}/attendance`}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<i className="tabler-calendar-stats" />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                View Attendance
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    )}

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerBatchSessionsPage;
