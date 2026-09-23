"use client"

import React, { useEffect, useState } from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import Link from 'next/link';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Chip,
    TextField,
    Rating,
    Divider,
    Skeleton,
    Alert
} from '@mui/material';

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

const LearnerPostReadPage = () => {
    const { lang } = useParams();
    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const { ready, apiGet, apiPost } = useApi();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drafts, setDrafts] = useState({}); // itemId -> draft text
    const [submittingId, setSubmittingId] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/user/learner/resource/post-read?batchId=${batchId}`);
            
            setItems(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ready || !batchId) return;
        fetchItems();
    }, [ready, batchId]);

    const handleSubmit = async (itemId) => {
        const text = drafts[itemId]?.trim();
        
        if (!text) return;

        try {
            setSubmittingId(itemId);
            await apiPost(`/user/learner/resource/post-read/${itemId}/submit`, {
                batchId,
                submission_text: text,
            });
            setDrafts((prev) => ({ ...prev, [itemId]: '' }));
            await fetchItems(); // refresh to show the new "submitted" state
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Button
                        component={Link}
                        variant='outlined'
                        href={batchId ? `/${lang}/apps/ilt-module/batch-session/${batchId}` : `/${lang}/apps/ilt-module/batch-list`}
                        startIcon={<i className="tabler-arrow-left text-lg" />}
                        sx={{ textTransform: 'none', fontWeight: 600, mb: 3 }}
                    >
                        Back to Sessions
                    </Button>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Assignments</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Complete and submit these to reinforce what was covered in the session.
                        </Typography>

                        {loading ? (
                            <Skeleton variant="rounded" height={200} />
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {items.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No assignments yet.</Typography>
                                )}

                                {items.map((item) => {
                                    const submission = item.mySubmission;
                                    const isGraded = submission?.status === 'graded';

                                    return (
                                        <Box
                                            key={item.id}
                                            sx={{ p: 3, borderRadius: 2.5, border: '1px solid', borderColor: submission ? 'success.main' : 'divider' }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="700">{item.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{item.type}</Typography>
                                                </Box>
                                                <Chip
                                                    label={submission ? (isGraded ? 'Graded' : 'Submitted') : 'Not submitted'}
                                                    size="small"
                                                    color={isGraded ? 'success' : submission ? 'info' : 'default'}
                                                    variant="outlined"
                                                />
                                            </Box>

                                            {isGraded && (
                                                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600}>Your score:</Typography>
                                                    <Rating value={submission.score || 0} max={5} readOnly size="small" />
                                                </Box>
                                            )}

                                            {submission ? (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Your submission</Typography>
                                                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{submission.text}</Typography>
                                                    {!isGraded && (
                                                        <>
                                                            <Divider sx={{ my: 2 }} />
                                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                                Want to change your answer? Submitting again will replace it.
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                minRows={3}
                                                                placeholder="Update your submission..."
                                                                value={drafts[item.id] ?? ''}
                                                                onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                                sx={{ mb: 1.5 }}
                                                            />
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                disabled={submittingId === item.id || !drafts[item.id]?.trim()}
                                                                onClick={() => handleSubmit(item.id)}
                                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                                            >
                                                                {submittingId === item.id ? 'Resubmitting...' : 'Resubmit'}
                                                            </Button>
                                                        </>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        minRows={4}
                                                        placeholder="Write your response here..."
                                                        value={drafts[item.id] ?? ''}
                                                        onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                        sx={{ mb: 1.5 }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        disabled={submittingId === item.id || !drafts[item.id]?.trim()}
                                                        onClick={() => handleSubmit(item.id)}
                                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                                    >
                                                        {submittingId === item.id ? 'Submitting...' : 'Submit'}
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Card>

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerPostReadPage;
