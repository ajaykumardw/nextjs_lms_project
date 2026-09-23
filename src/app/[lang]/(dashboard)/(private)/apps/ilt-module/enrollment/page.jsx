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

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const statusColor = (status) => ({
    confirmed: 'success',
    declined: 'error',
    nominated: 'warning',
    not_responded: 'warning',
}[status] || 'default');

const LearnerEnrollmentPage = () => {
    const { lang } = useParams();
    const { ready, apiGet, apiPut } = useApi();

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [respondingId, setRespondingId] = useState(null);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const data = await apiGet('/user/learner/enrollments');
            
            setEnrollments(data.enrollments || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ready) return;
        fetchEnrollments();
    }, [ready]);

    const respond = async (batchId, action) => {
        try {
            setRespondingId(batchId);
            await apiPut(`/user/learner/enrollments/${batchId}/respond`, { action });
            await fetchEnrollments();
        } catch (err) {
            setError(err.message);
        } finally {
            setRespondingId(null);
        }
    };

    const pending = enrollments.filter((e) => e.needsResponse);
    const responded = enrollments.filter((e) => !e.needsResponse);

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
                        <Typography variant="h4" fontWeight="700">My Enrollments</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Respond to batch nominations and review your enrollment history.
                        </Typography>
                    </Box>

                    {loading ? (
                        <Skeleton variant="rounded" height={300} />
                    ) : (
                        <>
                            <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                                    Awaiting Your Response {pending.length > 0 && `(${pending.length})`}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {pending.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">Nothing waiting on you right now.</Typography>
                                )}

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {pending.map((e) => (
                                        <Box
                                            key={e.batchId}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2.5,
                                                border: '1px solid',
                                                borderColor: 'warning.main',
                                                bgcolor: 'warning.50',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: { xs: 'flex-start', md: 'center' },
                                                flexDirection: { xs: 'column', md: 'row' },
                                                gap: 2
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="700">{e.batchName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(e.startDate)} - {formatDate(e.endDate)} {e.venue ? `· ${e.venue}` : ''}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    disabled={respondingId === e.batchId}
                                                    onClick={() => respond(e.batchId, 'decline')}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    Decline
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    disabled={respondingId === e.batchId}
                                                    onClick={() => respond(e.batchId, 'confirm')}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    {respondingId === e.batchId ? 'Saving...' : 'Confirm'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Card>

                            <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Enrollment History</Typography>
                                <Divider sx={{ mb: 2 }} />

                                {responded.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No past enrollments yet.</Typography>
                                )}

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {responded.map((e) => (
                                        <Box
                                            key={e.batchId}
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
                                                <Typography variant="subtitle2" fontWeight="700">{e.batchName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(e.startDate)} - {formatDate(e.endDate)}
                                                </Typography>
                                            </Box>
                                            <Chip label={e.status} size="small" color={statusColor(e.status)} variant="outlined" />
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

export default LearnerEnrollmentPage;
