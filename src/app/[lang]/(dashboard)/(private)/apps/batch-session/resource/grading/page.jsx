"use client";

import React, { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import Link from 'next/link';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Rating,
    Skeleton,
    Alert,
    Pagination,
    Stack
} from '@mui/material';

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const ITEMS_PER_PAGE = 10;

const GradingPage = () => {
    const { lang } = useParams();
    const router = useRouter();
    const { ready, apiGet, apiPut } = useApi();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!ready) return;

        let cancelled = false;

        (async () => {
            try {
                setLoading(true);

                const data = await apiGet('/user/trainer/resource/grading');

                if (!cancelled) {
                    setSubmissions(data.submissions || []);
                    setPage(1);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready]);

    const setScore = async (id, value) => {
        setSubmissions((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, score: value } : s
            )
        );

        try {
            await apiPut(`/user/trainer/resource/grading/${id}`, {
                score: value
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const pendingCount = submissions.filter(
        (s) => s.score === null || s.score === undefined
    ).length;

    // Pagination
    const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);

    const paginatedSubmissions = submissions.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handlePageChange = (_, value) => {
        setPage(value);
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>
            <Box
                sx={{
                    bgcolor: '#f8fafc',
                    minHeight: '100vh',
                    py: { xs: 3, md: 5 },
                    px: { xs: 2, md: 4 }
                }}
            >
                <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Top Actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                            mb: 4
                        }}
                    >
                        <Button
                            component={Link}
                            variant="outlined"
                            href={`/${lang}/apps/batch-session`}
                            startIcon={<i className="tabler-arrow-left text-lg" />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.primary',
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    borderColor: 'divider'
                                }
                            }}
                        >
                            Back to Dashboard
                        </Button>

                        <Button
                            component={Link}
                            href={`/${lang}/apps/batch-session/batches`}
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.primary',
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    borderColor: 'divider'
                                }
                            }}
                        >
                            View All Batches
                        </Button>
                    </Box>

                    {/* Main Content Card */}
                    <Card
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)'
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <Chip
                                label="Grading Queue"
                                color="warning"
                                size="small"
                                sx={{ mb: 1.5, fontWeight: 600 }}
                            />

                            <Typography
                                variant="h4"
                                fontWeight="700"
                                sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}
                            >
                                Pending Grading
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {pendingCount} submission
                                {pendingCount === 1 ? '' : 's'} awaiting review
                                across your batches. Click a learner batch to
                                open its cohort page.
                            </Typography>
                        </Box>

                        {loading ? (
                            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
                        ) : (
                            <>
                                <TableContainer
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        mb: 3
                                    }}
                                >
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead
                                            sx={{
                                                bgcolor: '#f1f5f9'
                                            }}
                                        >
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>
                                                    Learner
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>
                                                    Batch
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>
                                                    Assignment
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>
                                                    Submitted
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2, textAlign: 'center' }}>
                                                    Score
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {submissions.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} sx={{ py: 6 }}>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            textAlign="center"
                                                        >
                                                            No submissions found in the queue.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {paginatedSubmissions.map((s) => (
                                                <TableRow
                                                    key={s.id}
                                                    hover
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell sx={{ py: 2.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight="600"
                                                        >
                                                            {s.learner}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ py: 2.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            color="primary.main"
                                                            fontWeight={600}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                display: 'inline-block',
                                                                '&:hover': {
                                                                    textDecoration: 'underline'
                                                                }
                                                            }}
                                                            onClick={() =>
                                                                router.push(
                                                                    `/${lang}/apps/batch-session/batches/${s.batchId}`
                                                                )
                                                            }
                                                        >
                                                            {s.batch}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ py: 2.5 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {s.assignment}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ py: 2.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {s.submittedOn
                                                                ? new Date(
                                                                    s.submittedOn
                                                                ).toLocaleDateString()
                                                                : '—'}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell sx={{ py: 2.5, textAlign: 'center' }}>
                                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                                            <Rating
                                                                value={s.score || 0}
                                                                onChange={(_, value) =>
                                                                    setScore(s.id, value)
                                                                }
                                                                max={5}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Stack
                                    direction="row"
                                    justifyContent="center"
                                    alignItems="center"
                                    sx={{ pt: 1 }}
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
                            </>
                        )}
                    </Card>
                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default GradingPage;
