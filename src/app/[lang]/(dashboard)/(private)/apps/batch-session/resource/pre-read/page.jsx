"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Chip,
    Checkbox,
    LinearProgress,
    Skeleton,
    Alert
} from '@mui/material';
import Link from 'next/link';

import PermissionGuard from '@/hocs/PermissionClientGuard';
import { useApi } from '@/hooks/useApi';

const PreReadPage = () => {
    const { lang } = useParams();
    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');

    const qs = `?batchId=${batchId}&sessionId=${sessionId}`;
    const { ready, apiGet, apiPut } = useApi();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pre-read content is defined at the module level, so it only depends on
    // batchId (which resolves to a module). sessionId is kept in the URL for
    // navigation context (breadcrumb / "back to session") but is not needed
    // to fetch the list itself.
    useEffect(() => {
        if (!ready || !batchId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiGet(`/user/trainer/resource/pre-read?batchId=${batchId}`);
                if (!cancelled) {
                    setItems(
                        (data.items || []).map((item) => ({
                            ...item,
                            done: Boolean(item.completions) // adjust if API later returns a per-user "done" flag directly
                        }))
                    );
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId]);

    const completedCount = items.filter((i) => i.done).length;
    const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

    const toggleDone = async (id) => {
        const prevItems = items;
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
        );

        try {
            await apiPut(`/user/trainer/resource/pre-read/${id}/toggle`, { batchId });
        } catch (err) {
            setItems(prevItems); // revert on failure
            setError(err.message);
        }
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>

            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        <Button
                            component={Link}
                            variant='outlined'
                            href={batchId ? `/${lang}/apps/batch-session/batches/${batchId}` : `/${lang}/apps/batch-session/batches`}
                            startIcon={<i className="tabler-arrow-left text-lg" />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Back to Sessions
                        </Button>

                        {/* Resource tab switcher */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/pre-read${qs}`} size="small" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>Pre-read</Button>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/training-material${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Material</Button>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/post-read${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Post-read</Button>
                            {batchId && sessionId && (
                                <Button component={Link} href={`/${lang}/apps/batch-session/batches/${batchId}/sessions/${sessionId}/attendance`} size="small" variant="outlined" color="success" sx={{ textTransform: 'none', borderRadius: 2 }}>Attendance</Button>
                            )}
                        </Box>
                    </Box>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Chip label={`Session: ${sessionId || 'N/A'}`} color="primary" size="small" sx={{ mb: 1 }} />
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Pre-read Materials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Learners are asked to complete these items before the session begins. Track your own review status below.
                        </Typography>

                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="600">Review Progress</Typography>
                                <Typography variant="body2" color="text.secondary">{completedCount} of {items.length} completed</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>

                        {loading ? (
                            <Skeleton variant="rounded" height={200} />
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {items.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No pre-read items assigned yet.</Typography>
                                )}
                                {items.map((item) => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2.5,
                                            border: '1px solid',
                                            borderColor: item.done ? 'success.main' : 'divider',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            bgcolor: item.done ? 'success.50' : 'background.paper'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Checkbox checked={item.done} onChange={() => toggleDone(item.id)} />
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="700"
                                                    sx={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'text.secondary' : 'text.primary' }}
                                                >
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.type}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
                                            Open
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default PreReadPage;
