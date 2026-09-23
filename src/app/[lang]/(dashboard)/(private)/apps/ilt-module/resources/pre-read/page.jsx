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
    Checkbox,
    LinearProgress,
    Skeleton,
    Alert
} from '@mui/material';

import { toast } from 'react-toastify';

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

// Same preview modals the trainer's pre-read page uses, so learners get
// document/video/SCORM previews in place rather than a bare download link.
import ActivityModal from '../../ModalComponent/ActivityModal';
import ShowFileModal from '../../ModalComponent/ShowFileModal';
import ScormModalComponent from "../../ModalComponent/ScromModalComponent";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LearnerPreReadPage = () => {
    const { lang } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const qs = `?batchId=${batchId}&sessionId=${sessionId}`;

    const { data: authSession } = useSession();
    const token = authSession?.user?.token;

    const { ready, apiGet, apiPut } = useApi();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state — mirrors the trainer PreReadPage's handleCardClick flow.
    const [activityData, setActivityData] = useState();
    const [isOpen, setISOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docURL, setDocURL] = useState();
    const [isScormOpen, setIsScormOpen] = useState(false);
    const [selectedScorm, setSelectedScorm] = useState(null);
    const [scormLogData, setScormLogData] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiGet(`/user/learner/resource/pre-read?batchId=${batchId}`);
            
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

    const completedCount = items.filter((i) => i.done).length;
    const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

    const toggleDone = async (id) => {
        const prevItems = items;
        
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
        );

        try {
            await apiPut(`/user/learner/resource/pre-read/${id}/toggle`, { batchId });
            toast.success("Pre-read updated", { autoClose: 1000 });
        } catch (err) {
            setItems(prevItems); // revert on failure
            setError(err.message);
        }
    };

    const handleCardClick = (activity) => {
        const isDocumentType = activity.module_type_id === "688723af5dd97f4ccae68834";
        const isScorm = activity.module_type_id === "688723af5dd97f4ccae68837";
        const quesLength = activity?.questions?.length || 0;

        if (quesLength > 0) {
            router.push(`/${lang}/apps/ilt-module/quiz/${activity.module_id}/${activity.id}`);
        } else if (isScorm) {
            setSelectedScorm(activity);
            setScormLogData(activity?.scorm_data || null);
            setIsScormOpen(true);
        } else if (isDocumentType && activity.document_data?.image_url) {
            setActivityData(activity);
            setDocURL(activity.document_data.image_url);
            setIsModalOpen(true);
        } else {
            setActivityData(activity);
            setISOpen(true);
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
                            href={batchId ? `/${lang}/apps/ilt-module/batch-session/${batchId}` : `/${lang}/apps/ilt-module/batch-list`}
                            startIcon={<i className="tabler-arrow-left text-lg" />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Back to Sessions
                        </Button>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button component={Link} href={`/${lang}/apps/ilt-module/resources/pre-read${qs}`} size="small" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>Pre-read</Button>
                            <Button component={Link} href={`/${lang}/apps/ilt-module/resources/training-material${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Material</Button>
                            <Button component={Link} href={`/${lang}/apps/ilt-module/resources/post-read${qs}`} size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Post-read</Button>
                        </Box>
                    </Box>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>Pre-read Materials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Complete these before the session begins. Your progress is tracked automatically.
                        </Typography>

                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="600">Your Progress</Typography>
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
                                        {/* // LearnerPreReadPage.jsx — inside the items.map(...) block */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Checkbox
                                                checked={item.done}
                                                onChange={() => toggleDone(item.id)}
                                                inputProps={{ 'aria-label': 'Mark this pre-read as completed' }}
                                            />
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="700"
                                                    sx={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'text.secondary' : 'text.primary' }}
                                                >
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.type} · {item.done ? 'Completed by you' : 'Mark as completed'}
                                                </Typography>
                                            </Box>
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
                                ))}
                            </Box>
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
                activityId={activityData?.id}
                id={activityData?.module_type_id}
                readOnly   // ← add this
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
        </PermissionGuard>
    );
};

export default LearnerPreReadPage;
