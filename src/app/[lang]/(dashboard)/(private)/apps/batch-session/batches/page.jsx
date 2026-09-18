"use client"

import React, { useEffect, useState } from 'react';
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
    Alert,
    Pagination
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import Link from 'next/link';
import PermissionGuard from '@/hocs/PermissionClientGuard';
import { useApi } from '@/hooks/useApi';

const BATCHES_PER_PAGE = 6;

const BatchesListPage = () => {
    const { lang } = useParams();
    const { ready, apiGet } = useApi();

    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!ready) return;

        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await apiGet(
                    `/user/trainer/batches?page=${page}&limit=${BATCHES_PER_PAGE}`
                );

                if (!cancelled) {
                    setBatches(data.batches || []);
                    setTotalPages(data.pagination?.totalPages || 1);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, page]);

    const handlePageChange = (_, value) => {
        setPage(value);

        // Optional: scroll back to the top of the batch grid
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>

            <Box
                sx={{
                    bgcolor: '#f8fafc',
                    minHeight: '100vh',
                    py: 4,
                    px: { xs: 2, md: 4 }
                }}
            >
                <Container maxWidth="xl">

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Header */}
                    <Box
                        sx={{
                            mb: 4,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <div>
                            <Button
                                component={Link}
                                variant="outlined"
                                href={`/${lang}/apps/batch-session`}
                                startIcon={
                                    <i className="tabler-arrow-left text-lg" />
                                }
                                sx={{
                                    textTransform: 'none',
                                    mb: 1,
                                    fontWeight: 600
                                }}
                            >
                                Back to Dashboard
                            </Button>

                            <Typography variant="h4" fontWeight="700">
                                Assigned Training Batches
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Manage all active cohorts, view curriculum outlines,
                                and track attendance.
                            </Typography>
                        </div>

                        <Button
                            component={Link}
                            href={`/${lang}/apps/batch-session/resource/grading`}
                            variant="outlined"
                            color="warning"
                            startIcon={
                                <i className="tabler-file-text text-lg" />
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Grading Queue
                        </Button>
                    </Box>

                    {/* Batch Grid */}
                    <Grid container spacing={3}>

                        {loading &&
                            [1, 2, 3, 4, 5, 6].map((n) => (
                                <Grid
                                    size={{ xs: 12, md: 4 }}
                                    key={n}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        height={220}
                                    />
                                </Grid>
                            ))
                        }

                        {!loading && batches.length === 0 && (
                            <Grid size={12}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No batches assigned yet.
                                </Typography>
                            </Grid>
                        )}

                        {!loading && batches.map((batch) => (
                            <Grid
                                size={{ xs: 12, md: 4 }}
                                key={batch.id}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 2
                                            }}
                                        >
                                            <Chip
                                                label={batch.status}
                                                size="small"
                                                color={
                                                    batch.status === 'in_progress' ||
                                                        batch.status === 'open'
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                variant="outlined"
                                            />
                                        </Box>

                                        <Typography
                                            variant="h6"
                                            fontWeight="700"
                                            sx={{ mb: 1 }}
                                        >
                                            {batch.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <i className="tabler-calendar" />
                                            {batch.schedule}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                mb: 3
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'primary.lighter',
                                                    color: 'primary.main',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 2
                                                }}
                                            >
                                                <i className="tabler-users text-sm" />
                                            </Avatar>

                                            <Typography
                                                variant="body2"
                                                fontWeight="600"
                                            >
                                                {batch.learners.toLocaleString()} Learners Enrolled
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        component={Link}
                                        href={`/${lang}/apps/batch-session/batches/${batch.id}`}
                                        variant="contained"
                                        fullWidth
                                        endIcon={
                                            <i className="tabler-arrow-right text-lg" />
                                        }
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2
                                        }}
                                    >
                                        Manage Cohort
                                    </Button>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 5
                            }}
                        >
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default BatchesListPage;
