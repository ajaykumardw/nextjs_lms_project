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
    Divider,
    Skeleton,
    Alert
} from '@mui/material';

import Grid from "@mui/material/Grid2";

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const formatSessionDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const statusColor = (status) => ({
    present: 'success',
    late: 'warning',
    absent: 'error',
    pending: 'default',
}[status] || 'default');

const LearnerAttendancePage = () => {
    const params = useParams();
    const batchId = params?.bId;
    const lang = params?.lang;
    const { ready, apiGet } = useApi();

    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ready || !batchId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const data = await apiGet(`/user/learner/batches/${batchId}/attendance`);
                
                if (!cancelled) {
                    setHistory(data.history || []);
                    setSummary(data.summary || null);
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
                        Back to Sessions
                    </Button>

                    {loading ? (
                        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
                    ) : (
                        <>
                            <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                                <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>My Attendance</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Your attendance record across all sessions in this batch.
                                </Typography>

                                {summary && (
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary">Overall</Typography>
                                                <Typography variant="h6" fontWeight={700}>{summary.attendancePercentage}%</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary">Present</Typography>
                                                <Typography variant="h6" fontWeight={700}>{summary.presentCount}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary">Sessions Marked</Typography>
                                                <Typography variant="h6" fontWeight={700}>{summary.markedSessions}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary">Total Sessions</Typography>
                                                <Typography variant="h6" fontWeight={700}>{summary.totalSessions}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={12}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={summary.attendancePercentage}
                                                sx={{ height: 8, borderRadius: 4, mt: 1 }}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </Card>

                            <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Session-by-Session</Typography>
                                <Divider sx={{ mb: 2 }} />

                                {history.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No sessions scheduled yet.</Typography>
                                )}

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {history.map((h) => (
                                        <Box
                                            key={h.sessionId}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: 1
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="700">Session {h.sessionNumber}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatSessionDate(h.date)} · {h.startTime} - {h.endTime}
                                                    {h.remarks ? ` · ${h.remarks}` : ''}
                                                </Typography>
                                            </Box>
                                            <Chip label={h.status} size="small" color={statusColor(h.status)} variant="outlined" />
                                        </Box>
                                    ))}
                                </Box>
                            </Card>
                        </>
                    )}

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerAttendancePage;
