"use client"

import React, { useCallback, useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import Link from 'next/link';

import { useSession } from 'next-auth/react';

import { toast } from 'react-toastify';

import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    LinearProgress,
    Avatar,
    Divider,
    Skeleton,
    Alert
} from '@mui/material';

import Grid from "@mui/material/Grid2";

import PermissionGuard from '@/hocs/PermissionClientGuard';

import { useApi } from '@/hooks/useApi';

import { getLocalizedUrl } from "@/utils/i18n";

const SCORM_TYPE_ID = '688723af5dd97f4ccae68837';

const docType = {
    '688723af5dd97f4ccae68834': 'pdf',
    '688723af5dd97f4ccae68835': 'video',
    '688723af5dd97f4ccae68836': 'youtube-video',
    [SCORM_TYPE_ID]: 'scrom-content',
    '688723af5dd97f4ccae68838': 'web-link',
    '688723af5dd97f4ccae68839': 'subjective-sssessment',
    '688723af5dd97f4ccae6883a': 'flash-card',
    '68886902954c4d9dc7a379bd': 'quiz'
};

// Icons keyed by the module type id, so they always match what docType knows about
const iconByModuleType = {
    '688723af5dd97f4ccae68834': 'tabler-file-type-pdf',
    '688723af5dd97f4ccae68835': 'tabler-video',
    '688723af5dd97f4ccae68836': 'tabler-brand-youtube',
    [SCORM_TYPE_ID]: 'tabler-package',
    '688723af5dd97f4ccae68838': 'tabler-link',
    '688723af5dd97f4ccae68839': 'tabler-file-text',
    '688723af5dd97f4ccae6883a': 'tabler-cards',
    '68886902954c4d9dc7a379bd': 'tabler-help-circle',
};

const fileIcon = (item) =>
    iconByModuleType[item?.module_type_id] ||
    ({
        pdf: 'tabler-file-type-pdf',
        document: 'tabler-file-type-pdf',
        slides: 'tabler-presentation',
        video: 'tabler-video',
        youtube: 'tabler-brand-youtube',
        scorm: 'tabler-package',
        link: 'tabler-link',
    }[item?.type]) ||
    'tabler-file';

const LearnerMaterialPage = () => {

    const { lang } = useParams();

    const router = useRouter()

    const { data: authSession } = useSession();
    const token = authSession?.user?.token;

    const searchParams = useSearchParams();

    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const moduleId = searchParams?.get('moduleId');
    const contentFolderId = searchParams?.get('contentFolderId');

    if (!batchId || !sessionId || !moduleId || !contentFolderId) {
        notFound();
    }

    const { ready, apiGet, apiPost } = useApi();

    const [items, setItems] = useState([]);
    const [notFoundState, setNotFoundState] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderType, setOrderType] = useState('any');

    const fetchItems = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError(null);

            const data = await apiGet(
                `/user/learner/resource/material?batchId=${batchId}&moduleId=${moduleId}&sessionId=${sessionId}`
            );

            if (!data?.isAllowed) {
                setNotFoundState(true);
                
                return;
            }

            setItems(data?.items || []);
        } catch (err) {
            setError(err?.message || 'Failed to load materials.');
        } finally {
            if (showLoader) setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchId, moduleId, sessionId, ready]);

    useEffect(() => {
        if (!isClient || !ready) return;

        // Required query params are missing
        if (!batchId || !sessionId || !moduleId || !contentFolderId) {

            setNotFoundState(true);
            setLoading(false);
            
            return;
        }

        fetchItems();
    }, [
        isClient,
        ready,
        batchId,
        sessionId,
        moduleId,
        contentFolderId
    ]);

    const fetchSurveyData = useCallback(async () => {
        try {
            const surveyData = await apiGet(`/user/module/survey/data/${moduleId}`);

            setOrderType(surveyData?.module_setting?.orderType || 'any');
        } catch (err) {
            console.error(err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId, ready]);

    // Load items + module setting together
    useEffect(() => {
        if (!ready || !batchId || !moduleId) return;

        const load = async () => {
            setLoading(true);
            await Promise.all([fetchItems(false), fetchSurveyData()]);
            setLoading(false);
        };

        load();
    }, [ready, token, batchId, moduleId, sessionId, fetchItems, fetchSurveyData]);

    // Refresh progress when the learner comes back from the activity window
    useEffect(() => {
        if (!ready || !batchId) return;

        const onFocus = () => fetchItems(false);

        window.addEventListener('focus', onFocus);

        return () => window.removeEventListener('focus', onFocus);
    }, [ready, batchId, fetchItems]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const completedCount = items.filter((i) => i.done).length;
    const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

    const handleStartActivity = async (activityId, moduleTypeId) => {
        await apiPost("/user/learner/activity/new-attempt", {
            moduleId,
            contentFolderId,
            activityId,
            moduleTypeId,
            batchId,
            sessionId
        });
    };

    const handleStartExam = async (canOpen, url, activityId, moduleTypeId) => {
        if (!canOpen) {
            toast.error('Please complete the previous activity first.', { autoClose: 1000 });

            return;
        }

        // Open the window synchronously inside the click handler so popup blockers allow it
        const newWindow = window.open(
            '',
            '_blank',
            `width=${window.screen.availWidth},height=${window.screen.availHeight},toolbar=1,location=0,scrollbars=no,resizable=no`
        );

        if (!newWindow) {
            toast.error('Popup blocked. Please allow popups for this site.');

            return;
        }

        try {
            // Create the attempt first, then load the activity
            await handleStartActivity(activityId, moduleTypeId);
            newWindow.location.href = url;
        } catch (err) {
            console.error(err);
            newWindow.close();
            toast.error('Unable to start activity.');
        }

        // NOTE: right-click / F12 / text-selection blocking must live inside the
        // /ilt-activity page itself. Listeners added here are wiped as soon as the
        // new window navigates, so they never worked from this page.
    };

    if (!isClient) return null;

    if (notFoundState) {
        return (
            <PermissionGuard element="isUser" locale={lang}>
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 2,
                        bgcolor: '#f8fafc'
                    }}
                >
                    <Card
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            maxWidth: 500,
                            width: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                        >
                            Page Not Found
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            This pre-read resource is not available for this
                            session or you do not have permission to access it.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() =>
                                router.push(
                                    batchId
                                        ? `/${lang}/apps/ilt-module/batch-session/${batchId}`
                                        : `/${lang}/apps/ilt-module/batch-list`
                                )
                            }
                        >
                            Back to Sessions
                        </Button>
                    </Card>
                </Box>
            </PermissionGuard>
        );
    }

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

                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="600">Your Progress</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {completedCount} of {items.length} completed
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {loading ? (
                            <Skeleton variant="rounded" height={200} />
                        ) : (
                            <Grid container spacing={2.5}>
                                {items.length === 0 && (
                                    <Grid size={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            No materials shared yet.
                                        </Typography>
                                    </Grid>
                                )}

                                {items.map((item, index) => {
                                    const moduleTypeId = item?.module_type_id;
                                    const isCompleted = Boolean(item?.done);

                                    const prevActivity = items[index - 1];
                                    const prevLog = prevActivity?.logs?.[0];

                                    const prevCompleted =
                                        Boolean(prevActivity?.done) ||
                                        Boolean(prevLog?.done && Number(prevLog?.completion_percentage) >= 100) ||
                                        prevLog?.scorm_data?.lessonStatus === "passed";

                                    const isOrdered = orderType === "ordered";
                                    const canOpen = !isOrdered || index === 0 || prevCompleted;

                                    const isDisabled = isCompleted && moduleTypeId === SCORM_TYPE_ID;

                                    const examPageUrl =
                                        window.location.origin +
                                        getLocalizedUrl(
                                            `/ilt-activity?type=${docType[moduleTypeId]}&activityId=${item?.id}&moduleId=${moduleId}&contentFolderId=${contentFolderId}&moduleTypeId=${moduleTypeId}&batchId=${batchId}&sessionId=${sessionId}`,
                                            lang
                                        );

                                    let buttonLabel = 'Start';

                                    if (isCompleted) buttonLabel = 'Completed';
                                    else if (!canOpen) buttonLabel = 'Locked';
                                    else if (item?.logs?.length) buttonLabel = 'In Progress';

                                    return (
                                        <Grid size={{ xs: 12, sm: 6 }} key={item?.id || index}>
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
                                                    height: '100%',
                                                    opacity: canOpen ? 1 : 0.6
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', borderRadius: 2 }}>
                                                        <i className={`${fileIcon(item)} text-xl`} />
                                                    </Avatar>

                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            fontWeight="700"
                                                            noWrap
                                                            sx={{
                                                                textDecoration: isCompleted ? 'line-through' : 'none',
                                                                color: isCompleted ? 'text.secondary' : 'text.primary'
                                                            }}
                                                        >
                                                            {item?.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item?.type} · {isCompleted ? 'Completed by you' : 'Not completed'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Button
                                                    variant="contained"
                                                    color={isCompleted ? "success" : "primary"}
                                                    disabled={isDisabled}
                                                    onClick={() => handleStartExam(canOpen, examPageUrl, item?.id, moduleTypeId)}
                                                    sx={{
                                                        textTransform: "none",
                                                        height: 32,
                                                        px: 2,
                                                        fontSize: "0.75rem",
                                                        borderRadius: 1,
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {buttonLabel}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Card>

                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerMaterialPage;
