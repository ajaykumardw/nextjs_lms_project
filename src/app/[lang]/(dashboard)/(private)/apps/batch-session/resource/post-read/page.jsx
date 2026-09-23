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
    Skeleton,
    Alert,
    Snackbar
} from '@mui/material';

import { toast } from 'react-toastify';

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';


const PostReadPage = () => {
    const { lang } = useParams();
    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const qs = `?batchId=${batchId}&sessionId=${sessionId}`;
    const { ready, apiGet, apiPut } = useApi();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState('');

    // Post-read content is module-level (depends only on batchId -> module).
    // Facilitator notes remain session-specific, so that fetch still needs sessionId.
    useEffect(() => {
        if (!ready || !batchId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const calls = [apiGet(`/user/trainer/resource/post-read?batchId=${batchId}`)];
                
                if (sessionId) {
                    calls.push(apiGet(`/user/trainer/batches/${batchId}/sessions/${sessionId}/notes`));
                }

                const [postReadData, notesData] = await Promise.all(calls);

                if (!cancelled) {

                    setItems(postReadData.items || []);
                    if (notesData) setNote(notesData.note?.outcome_notes || '');
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId, sessionId]);

    const saveNotes = async () => {
        if (!sessionId) return;
        
        try {
            setSaving(true);
            await apiPut(`/user/trainer/batches/${batchId}/sessions/${sessionId}/notes`, { outcome_notes: note });
            toast.success("Notes saved successfully", {
                autoClose: 1000
            })
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
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

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/pre-read${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Pre-read</Button>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/training-material${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Material</Button>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/post-read${qs}`} size="small" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>Post-read</Button>
                            {batchId && sessionId && (
                                <Button component={Link} href={`/${lang}/apps/batch-session/batches/${batchId}/sessions/${sessionId}/attendance`} size="small" variant="outlined" color="success" sx={{ textTransform: 'none', borderRadius: 2 }}>Attendance</Button>
                            )}
                        </Box>
                    </Box>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Post-read Materials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Assigned to learners after this session to reinforce and extend what was covered.
                        </Typography>

                        {loading ? (
                            <Skeleton variant="rounded" height={200} />
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                                    {items.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">No post-read items assigned yet.</Typography>
                                    )}
                                    {items.map((item) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 2
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="700">{item.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.type} · {item.submissions} submission{item.submissions === 1 ? '' : 's'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5 }}>Facilitator Notes for Next Session</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    placeholder="Add notes on how this session landed, topics to revisit, or learners who need follow-up..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    sx={{ mb: 2 }}
                                    disabled={!sessionId}
                                />
                                <Button variant="contained" onClick={saveNotes} disabled={saving || !sessionId} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                    {saving ? 'Saving...' : 'Save Notes'}
                                </Button>
                            </>
                        )}
                    </Card>

                </Container>
            </Box>

            <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
        </PermissionGuard>
    );
};

export default PostReadPage;
