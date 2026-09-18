"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Divider,
    Skeleton,
    Alert,
    Pagination,
    Stack
} from '@mui/material';
import Link from 'next/link';
import PermissionGuard from '@/hocs/PermissionClientGuard';
import { useApi } from '@/hooks/useApi';

const ITEMS_PER_PAGE = 5;

const formatSessionDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const BatchSessionsPage = () => {

    const params = useParams();
    const batchId = params?.bId;
    const lang = params?.lang;
    const { ready, apiGet } = useApi();

    const [batch, setBatch] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!ready || !batchId) return;

        let cancelled = false;

        (async () => {
            try {
                setLoading(true);

                const data = await apiGet(`/user/trainer/batches/${batchId}`);
                if (!cancelled) {
                    setBatch(data.batch);
                    setSessions(data.sessions || []);
                    setPage(1);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId]);

    // Pagination calculations
    const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
    const paginatedSessions = sessions.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handlePageChange = (_, value) => {
        setPage(value);
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>

            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    {/* Back Link & Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        <Button
                            component={Link}
                            variant='outlined'
                            href={`/${lang}/apps/batch-session/batches`}
                            startIcon={<i className="tabler-arrow-left text-lg" />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.primary',
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }
                            }}
                        >
                            Back to All Batches
                        </Button>
                        <Button
                            component={Link}
                            href={`/${lang}/apps/batch-session/resource/grading`}
                            variant="outlined"
                            color="warning"
                            startIcon={<i className="tabler-file-text text-lg" />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            Grade Submissions
                        </Button>
                    </Box>

                    {loading ? (
                        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
                    ) : (
                        <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>{batch?.name || 'Cohort Details'}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Manage session materials, update pre/post-reads, and view attendance rosters below.
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Curriculum & Sessions</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
                                {sessions.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                        No sessions scheduled yet.
                                    </Typography>
                                )}

                                {paginatedSessions.map((sess) => (
                                    <Box
                                        key={sess._id}
                                        sx={{
                                            p: 3,
                                            borderRadius: 2.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', md: 'center' },
                                            flexDirection: { xs: 'column', md: 'row' },
                                            gap: 2,
                                            bgcolor: 'background.paper'
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="700">Session {sess.session_number}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                🗓️ {formatSessionDate(sess.session_date)} | ⏰ {sess.start_time} - {sess.end_time}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: { xs: '100%', md: 'auto' } }}>
                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/resource/pre-read?batchId=${batchId}&sessionId=${sess._id}`}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<i className="tabler-book text-base" />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Pre-read
                                            </Button>

                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/resource/training-material?batchId=${batchId}&sessionId=${sess._id}`}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<i className="tabler-file-download text-base" />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Material
                                            </Button>

                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/resource/post-read?batchId=${batchId}&sessionId=${sess._id}`}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<i className="tabler-books text-base" />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Post-read
                                            </Button>

                                            <Button
                                                component={Link}
                                                href={`/${lang}/apps/batch-session/batches/${batchId}/sessions/${sess._id}/attendance`}
                                                variant="contained"
                                                size="small"
                                                startIcon={<i className="tabler-checkbox text-base" />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Attendance
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Pagination Controls */}
                            <Stack
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
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

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default BatchSessionsPage;
