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
    Avatar,
    Divider,
    Skeleton,
    Alert
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import Link from 'next/link';
import PermissionGuard from '@/hocs/PermissionClientGuard';
import { useApi } from '@/hooks/useApi';

const fileIcon = (type) => {
    switch (type) {
        case 'pdf': return 'tabler-file-type-pdf';
        case 'document': return 'tabler-file-type-pdf';
        case 'slides': return 'tabler-presentation';
        case 'video': return 'tabler-video';
        case 'youtube': return 'tabler-brand-youtube';
        case 'scorm': return 'tabler-package';
        case 'link': return 'tabler-link';
        default: return 'tabler-file';
    }
};

const formatSize = (bytes) => {
    if (!bytes) return null;
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

const MaterialPage = () => {
    const { lang } = useParams();
    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const qs = `?batchId=${batchId}&sessionId=${sessionId}`;
    const { ready, apiGet, apiDelete } = useApi();

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Materials are module-level content, so the list only depends on batchId
    // (which resolves to a module) — sessionId is kept in the querystring for
    // navigation context only.
    const fetchMaterials = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiGet(`/user/trainer/resource/material?batchId=${batchId}`);
            setMaterials(data.materials || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ready || !batchId) return;
        fetchMaterials();
    }, [ready, batchId]);

    const handleDelete = async (materialId) => {
        try {
            await apiDelete(`/user/trainer/resource/material/${materialId}`);
            setMaterials((prev) => prev.filter((m) => m._id !== materialId));
        } catch (err) {
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

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/pre-read${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Pre-read</Button>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/training-material${qs}`} size="small" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>Material</Button>
                            <Button component={Link} href={`/${lang}/apps/batch-session/resource/post-read${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Post-read</Button>
                            {batchId && sessionId && (
                                <Button component={Link} href={`/${lang}/apps/batch-session/batches/${batchId}/sessions/${sessionId}/attendance`} size="small" variant="outlined" color="success" sx={{ textTransform: 'none', borderRadius: 2 }}>Attendance</Button>
                            )}
                        </Box>
                    </Box>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Chip label={`Session: ${sessionId || 'N/A'}`} color="primary" size="small" sx={{ mb: 1 }} />
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Session Materials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Download or share these resources with your learners for this session.
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        {loading ? (
                            <Skeleton variant="rounded" height={200} />
                        ) : (
                            <Grid container spacing={2.5}>
                                {materials.length === 0 && (
                                    <Grid size={12}>
                                        <Typography variant="body2" color="text.secondary">No materials uploaded yet.</Typography>
                                    </Grid>
                                )}
                                {materials.map((mat) => {
                                    const size = formatSize(mat.file_size);
                                    return (
                                        <Grid size={{ xs: 12, sm: 6 }} key={mat._id}>
                                            <Box
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 2.5,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 2,
                                                    height: '100%'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', borderRadius: 2 }}>
                                                        <i className={`${fileIcon(mat.type)} text-xl`} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="700">{mat.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {mat.type}{size ? ` · ${size}` : ''}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        component={mat.file_url ? "a" : "button"}
                                                        href={mat.file_url || undefined}
                                                        target={mat.file_url ? "_blank" : undefined}
                                                        disabled={!mat.file_url}
                                                        startIcon={<i className="tabler-download text-base" />}
                                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                                    >
                                                        Get
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        variant="text"
                                                        onClick={() => handleDelete(mat._id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Button variant="contained" startIcon={<i className="tabler-upload text-lg" />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                            Upload New Material
                        </Button>
                    </Card>

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default MaterialPage;
