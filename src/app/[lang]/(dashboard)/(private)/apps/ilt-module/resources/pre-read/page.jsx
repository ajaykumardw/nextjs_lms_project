"use client"

import React, { useEffect, useState, useRef } from 'react';

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

import { getLocalizedUrl } from "@/utils/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LearnerPreReadPage = () => {

    const { lang } = useParams();

    const searchParams = useSearchParams();
    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const moduleId = searchParams?.get('moduleId');
    const contentFolderId = searchParams?.get("contentFolderId")
    const qs = `?batchId=${batchId}&sessionId=${sessionId}`;

    const { data: authSession } = useSession();
    const token = authSession?.user?.token;

    const { ready, apiGet, apiPut, apiPost } = useApi();

    const [items, setItems] = useState([]);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [remainingAttempts, setRemainingAttempts] = useState(0)
    const [settingData, setSettingData] = useState()

    const fetchItems = async () => {
        try {

            setLoading(true);
            setError(null);

            const data = await apiGet(`/user/learner/resource/pre-read?batchId=${batchId}&moduleId=${moduleId}&sessionId=${sessionId}`);

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
            await apiPut(`/user/learner/resource/pre-read/${id}/toggle`, { batchId, sessionId });
            toast.success("Pre-read updated", { autoClose: 1000 });
        } catch (err) {
            setItems(prevItems); // revert on failure
            setError(err.message);
        }
    };

    const moduleTypeLabel = {
        '688723af5dd97f4ccae68834': 'Documents & Slides',
        '688723af5dd97f4ccae68835': 'Video',
        '688723af5dd97f4ccae68836': 'YouTube Video',
        '688723af5dd97f4ccae68837': 'Scorm Content',
        '688723af5dd97f4ccae68838': 'Web Link',
        '688723af5dd97f4ccae68839': 'Subjective Assessment',
        '688723af5dd97f4ccae6883a': 'Flash Card',
        '68886902954c4d9dc7a379bd': 'Quiz'
    }

    const docType = {
        '688723af5dd97f4ccae68834': 'pdf',
        '688723af5dd97f4ccae68835': 'video',
        '688723af5dd97f4ccae68836': 'youtube-video',
        '688723af5dd97f4ccae68837': 'scrom-content',
        '688723af5dd97f4ccae68838': 'web-link',
        '688723af5dd97f4ccae68839': 'subjective-sssessment',
        '688723af5dd97f4ccae6883a': 'flash-card',
        '68886902954c4d9dc7a379bd': 'quiz'
    }

    const fetchSurveyData = async () => {
        try {
            const surveyData = await apiGet(`/user/module/survey/data/${moduleId}`)

            setSettingData({ orderType: surveyData?.module_setting?.orderType || 'any' })

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            if (!API_URL || !token || !moduleId) return;

            setLoading(true);

            await Promise.all([

                fetchSurveyData(),
            ]);

            setLoading(false);
        };

        loadData();
    }, [API_URL, token, moduleId]);

    const handleStartActivity = async (url, activityId, moduleTypeId) => {
        try {

            const urlStr = url;

            const parsedUrl = new URL(urlStr, 'http://dummy-base.com');
            const params = parsedUrl.searchParams;

            const moduleId = params.get('moduleId');
            const contentFolderId = params.get('contentFolderId');

            await apiPost("/user/learner/activity/new-attempt", { moduleId, contentFolderId, activityId, moduleTypeId, batchId, sessionId })

        } catch (error) {
            console.error(error);
            toast.error("Unable to start activity.");
        }
    }

    const handleStartExam = (canOpen, url, pageUrl, activityId, moduleTypeId) => {

        if (!canOpen) {

            toast.error('Please complete the previous activity first.', { autoClose: 1000 })

            return
        }

        if (typeof window !== "undefined") {
            // Open a new window with the given URL, and additional window options

            handleStartActivity(pageUrl, activityId, moduleTypeId)

            const newWindow = window.open(url, '_blank', "width=" + window.screen.availWidth + ",height=" + window.screen.availHeight + ",toolbar=1,location=0,scrollbars=no,resizable=no");

            // Check if the window opened successfully
            if (newWindow) {
                // Disable right-click and context menu in the new window
                newWindow.document.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });

                // Disable text selection in the new window
                newWindow.document.body.style.userSelect = 'none';

                // Disable certain keyboard shortcuts like F12 (inspect) and Ctrl+Shift+I, Ctrl+Shift+J
                newWindow.document.addEventListener('keydown', (e) => {
                    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, F1 (help)
                    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || e.key === 'F1') {
                        e.preventDefault();
                    }
                });

                // Decrease remaining attempts temporarily here; ideally, this should be done after exam submission
                setRemainingAttempts(prev => prev > 0 ? prev - 1 : 0);

                // Disable resizing the window (it's already in the `window.open()` options, but you can reinforce it)
                // newWindow.resizeTo(1024, 750);
            } else {
                alert('Popup blocked. Please allow popups for this site.');
            }
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Ensure the code below only runs client-side
    if (!isClient) {
        return null; // Return nothing while waiting for the component to mount
    }

    if (loading) return null

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
                                {items.map((item, index) => {

                                    console.log("Item data" + " " + index, item, contentFolderId, moduleId, batchId,);

                                    const moduleTypeId = item?.module_type_id;
                                    const isCompleted = Boolean(item?.done);

                                    const prevActivity = items?.[index - 1];
                                    const prevLog = prevActivity?.logs?.[0];

                                    const prevCompleted = Boolean(prevLog?.done && Number(prevLog?.completion_percentage) >= 100) || prevLog?.scorm_data?.lessonStatus === "passed";

                                    const isOrdered = settingData?.orderType === "ordered";

                                    const canOpen = !isOrdered || index === 0 || prevCompleted;

                                    const pageURL = `/${lang}/apps/ilt-module/resources/pre-read?batchId=${batchId}&sessionId=${sessionId}&moduleId=${moduleId}&contentFolderId=${contentFolderId}`;

                                    const isDisabled = isCompleted && moduleTypeId === "688723af5dd97f4ccae68837";

                                    const examPageUrl = window.location.origin + getLocalizedUrl(`/ilt-activity?type=${docType?.[moduleTypeId]}&activityId=${item?.id}&moduleId=${moduleId}&contentFolderId=${contentFolderId}&moduleTypeId=${moduleTypeId}&batchId=${batchId}&sessionId=${sessionId}`, lang);

                                    return (
                                        <Box
                                            key={index}
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
                                                variant="contained"
                                                color={isCompleted ? "success" : "primary"}
                                                disabled={isDisabled}
                                                onClick={() => handleStartExam(canOpen, examPageUrl, pageURL, item?.id, moduleTypeId)}
                                                sx={{
                                                    textTransform: "none",
                                                    height: 32,
                                                    px: 2,
                                                    fontSize: "0.75rem",
                                                    borderRadius: 1,
                                                }}
                                            >
                                                {isCompleted ? "Completed" : "In Progress"}
                                            </Button>
                                        </Box>
                                    )
                                })}
                            </Box>
                        )}
                    </Card>

                </Container>
            </Box>
        </PermissionGuard >
    );
};

export default LearnerPreReadPage;
