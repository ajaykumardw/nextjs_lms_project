"use client"

import React, { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import Link from 'next/link';

import { useSession } from 'next-auth/react';

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

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

import ActivityModal from '../../ModalComponent/ActivityModal';
import ShowFileModal from '../../ModalComponent/ShowFileModal';
import ScormModalComponent from "../../ModalComponent/ScromModalComponent"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PostReadPage = () => {
    const { lang } = useParams();
    const router = useRouter()

    const { data: session } = useSession();
    const token = session?.user?.token;

    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const qs = `?batchId=${batchId}&sessionId=${sessionId}`;
    const { ready, apiGet, apiPut } = useApi();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snack, setSnack] = useState('');

    const [activityData, setActivityData] = useState()
    const [isScormOpen, setIsScormOpen] = useState(false)

    const [isOpen, setISOpen] = useState(false);
    const [docURL, setDocURL] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedScorm, setSelectedScorm] = useState(null);
    const [scormLogData, setScormLogData] = useState(null);

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

                const [postReadData] = await Promise.all(calls);

                if (!cancelled) {

                    setItems(postReadData.items || []);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId, sessionId]);

    const handleCardClick = (activity) => {


        const isDocumentType = activity.module_type_id === "688723af5dd97f4ccae68834";
        const isScorm = activity?.module_type_id === "688723af5dd97f4ccae68837"
        const quesLength = activity?.questions?.length || 0;

        if (quesLength > 0) {

            router.replace(`/${lang}/apps/batch-session/quiz/${activity?.module_id}/${activity?.id}`);

        } else if (isScorm) {

            setSelectedScorm(activity);
            setScormLogData(activity?.scorm_data || null);
            setIsScormOpen(true);

        } else {

            setISOpen(false);
            setIsModalOpen(false);

            setActivityData(activity)

            setTimeout(() => {

                if (isDocumentType && activity.document_data?.image_url) {
                    setDocURL(activity.document_data.image_url);
                    setIsModalOpen(true);
                } else {
                    setISOpen(true);
                }
            }, 10);
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
                                        <div
                                            key={item.id}
                                        >
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
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                    onClick={() => handleCardClick(item)}
                                                >
                                                    Open
                                                </Button>
                                            </Box>
                                        </div>
                                    ))}
                                </Box>
                            </>
                        )}
                    </Card>
                    <ActivityModal
                        open={isOpen}
                        setISOpen={setISOpen}
                        API_URL={API_URL}
                        token={token}
                        editData={activityData}
                        activityId={activityData?._id}
                        id={activityData?.module_type_id}
                    />
                    <ShowFileModal
                        open={isModalOpen}
                        setOpen={setIsModalOpen}
                        docURL={docURL}
                    />

                    <ScormModalComponent
                        open={isScormOpen}
                        setOpen={setIsScormOpen}
                        scormLogData={scormLogData}
                        setScormLogData={setScormLogData}
                        selectedScorm={selectedScorm}
                    />
                </Container>
            </Box>

            <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
        </PermissionGuard >
    );
};

export default PostReadPage;
