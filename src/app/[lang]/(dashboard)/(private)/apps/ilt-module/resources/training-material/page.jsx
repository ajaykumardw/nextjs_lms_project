"use client"

import React, { useEffect, useState } from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import Link from 'next/link';

import { useSession } from 'next-auth/react';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    Avatar,
    Divider,
    Skeleton,
    Alert
} from '@mui/material';

import Grid from "@mui/material/Grid2";

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

// Reuse the same modal components the trainer's pre-read page uses, so
// learners get the same in-place preview instead of a bare download link.
import ActivityModal from '../../ModalComponent/ActivityModal';
import ShowFileModal from '../../ModalComponent/ShowFileModal';
import ScormModalComponent from "../../ModalComponent/ScromModalComponent";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fileIcon = (type) => ({
    pdf: 'tabler-file-type-pdf',
    document: 'tabler-file-type-pdf',
    slides: 'tabler-presentation',
    video: 'tabler-video',
    youtube: 'tabler-brand-youtube',
    scorm: 'tabler-package',
    link: 'tabler-link',
}[type] || 'tabler-file');

const LearnerMaterialPage = () => {
    const { lang } = useParams();
    const { data: authSession } = useSession();
    const token = authSession?.user?.token;
    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const { ready, apiGet } = useApi();

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activityData, setActivityData] = useState();
    const [isOpen, setISOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docURL, setDocURL] = useState();
    const [isScormOpen, setIsScormOpen] = useState(false);
    const [selectedScorm, setSelectedScorm] = useState(null);

    useEffect(() => {
        if (!ready || !batchId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const data = await apiGet(`/user/learner/resource/material?batchId=${batchId}`);
                
                if (!cancelled) setMaterials(data.materials || []);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId]);

    const handleOpen = (mat) => {
        const isDocumentType = mat.module_type_id === "688723af5dd97f4ccae68834";
        const isScorm = mat.module_type_id === "688723af5dd97f4ccae68837";

        if (isScorm) {
            setSelectedScorm(mat);
            setIsScormOpen(true);
        } else if (isDocumentType && mat.document_data?.image_url) {
            setDocURL(mat.document_data.image_url);
            setIsModalOpen(true);
        } else {
            setActivityData(mat);
            setISOpen(true);
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
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Session Materials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Resources shared for this session.
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        {loading ? (
                            <Skeleton variant="rounded" height={200} />
                        ) : (
                            <Grid container spacing={2.5}>
                                {materials.length === 0 && (
                                    <Grid size={12}>
                                        <Typography variant="body2" color="text.secondary">No materials shared yet.</Typography>
                                    </Grid>
                                )}
                                {materials.map((mat) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={mat._id}>
                                        <Box sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, height: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', borderRadius: 2 }}>
                                                    <i className={`${fileIcon(mat.type)} text-xl`} />
                                                </Avatar>
                                                <Typography variant="subtitle2" fontWeight="700">{mat.title}</Typography>
                                            </Box>
                                            <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => handleOpen(mat)}>
                                                Open
                                            </Button>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Card>

                </Container>
            </Box>

            <ActivityModal
                open={isOpen}
                setISOpen={setISOpen}
                API_URL={API_URL}
                token={token}
                editData={activityData}
                activityId={activityData?._id}
                id={activityData?.module_type_id}
            />
            <ShowFileModal open={isModalOpen} setOpen={setIsModalOpen} docURL={docURL} />
            <ScormModalComponent
                open={isScormOpen}
                setOpen={setIsScormOpen}
                selectedScorm={selectedScorm}
                scormLogData={selectedScorm?.scorm_data}
                setScormLogData={() => { }}
            />
        </PermissionGuard>
    );
};

export default LearnerMaterialPage;
