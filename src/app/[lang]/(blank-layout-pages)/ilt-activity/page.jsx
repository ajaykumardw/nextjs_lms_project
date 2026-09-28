'use client';

import React, { useState, useEffect, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

import dynamic from 'next/dynamic';

import { useSession } from 'next-auth/react';

import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Card,
    CardContent,
    Button,
    Typography,
    Skeleton,
    CardActions,
    CardHeader
} from '@mui/material';

import { toast } from 'react-toastify';

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

import SurveyModalComponent from '@/components/survey-modal/page';

import { useApi } from '@/hooks/useApi';

const PDFViewer = dynamic(() => import('@/components/Content-data/PdfViewer/index'), { ssr: false });
const DocViewer = dynamic(() => import('@/components/Content-data/DocViewer/index'), { ssr: false });
const PptViewer = dynamic(() => import('@/components/Content-data/PptViewer/index'), { ssr: false });
const YouTubePlayerComponent = dynamic(() => import('@/components/Content-data/youtube-player/page'), { ssr: false });
const QuizQuestionComponent = dynamic(() => import('@/components/ilt-section/quiz-section/page'), { ssr: false });
const ScromContentComponent = dynamic(() => import('@/components/ilt-section/quiz-section/page'), { ssr: false });

const moduleTypeLabel = {
    '688723af5dd97f4ccae68834': 'Documents & Slides',
    '688723af5dd97f4ccae68835': 'Video',
    '688723af5dd97f4ccae68836': 'YouTube Video',
    '688723af5dd97f4ccae68837': 'Scrom Content',
    '688723af5dd97f4ccae68838': 'Web Link',
    '688723af5dd97f4ccae68839': 'Subjective Assessment',
    '688723af5dd97f4ccae6883a': 'Flash Card',
    '68886902954c4d9dc7a379bd': 'Quiz'
};

const ContentData = () => {
    const searchParams = useSearchParams();

    const activityId = searchParams.get('activityId');
    const types = searchParams.get('type');
    const moduleId = searchParams.get('moduleId');
    const contentFolderId = searchParams.get('contentFolderId');
    const moduleTypeId = searchParams.get('moduleTypeId');
    const batchId = searchParams.get('batchId');
    const sessionId = searchParams.get('sessionId');

    const { ready, apiPost } = useApi();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ASSET_URL = process.env.NEXT_PUBLIC_ASSETS_URL;
    const { data: session } = useSession();

    const token = session?.user?.token;

    const saveTimeout = useRef(null);
    const fieldAutosaveTimer = useRef(null);
    const quizAutosaveTimer = useRef(null);
    const isLeavingRef = useRef(false);
    const initialUrlRef = useRef('');
    const beforeUnloadHandlerRef = useRef(null);

    const [data, setData] = useState(null);
    const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [surveyModalOpen, setSurveyModalOpen] = useState(false);
    const [scormData, setScormData] = useState({});
    const [isInstruction, setInstruction] = useState(false);
    const [isQuizClose, setIsQuizClose] = useState(false);
    const [quizData, setQuizData] = useState([]);
    const [blurred, setBlurred] = useState(false);

    const [fieldData, setFieldData] = useState({
        currentPage: 0,
        totalPages: 0,
        viewedPages: [],
        currentVideoTime: 0,
        viewedVideoTime: 0,
        totalVideoTime: 0
    });

    // Common ids sent with every save request
    const baseIds = {
        moduleId,
        contentFolderId,
        activityId,
        moduleTypeId,
        batchId,
        sessionId
    };

    const closeWindow = () => {
        setTimeout(() => {
            if (beforeUnloadHandlerRef.current) {
                window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
            }

            window.close();
        }, 300);
    };

    /* ------------------------------------------------------------------ */
    /* Fullscreen / anti-cheat listeners                                   */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen?.();
            }
        };
    }, []);

    useEffect(() => {
        const handler = () => {
            if (!document.fullscreenElement) {
                toast.error('Please stay in fullscreen mode.');
            }
        };

        document.addEventListener('fullscreenchange', handler);

        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    useEffect(() => {
        const prevent = e => e.preventDefault();

        document.addEventListener('contextmenu', prevent);
        document.addEventListener('copy', prevent);
        document.addEventListener('cut', prevent);
        document.addEventListener('paste', prevent);
        document.addEventListener('dragstart', prevent);

        return () => {
            document.removeEventListener('contextmenu', prevent);
            document.removeEventListener('copy', prevent);
            document.removeEventListener('cut', prevent);
            document.removeEventListener('paste', prevent);
            document.removeEventListener('dragstart', prevent);
        };
    }, []);

    useEffect(() => {
        const handler = e => {
            const key = e.key?.toUpperCase();

            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
                (e.ctrlKey && ['U', 'S', 'P', 'C', 'V', 'X', 'A'].includes(key))
            ) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('keydown', handler, true);

        return () => window.removeEventListener('keydown', handler, true);
    }, []);

    useEffect(() => {
        const visibility = () => {
            if (document.hidden) {
                toast.error('Tab switching detected.');
            }
        };

        document.addEventListener('visibilitychange', visibility);

        return () => document.removeEventListener('visibilitychange', visibility);
    }, []);

    useEffect(() => {
        const blur = () => setBlurred(true);
        const focus = () => setBlurred(false);

        window.addEventListener('blur', blur);
        window.addEventListener('focus', focus);

        return () => {
            window.removeEventListener('blur', blur);
            window.removeEventListener('focus', focus);
        };
    }, []);

    /* ------------------------------------------------------------------ */
    /* Fetch activity (only once the session token is ready)               */
    /* ------------------------------------------------------------------ */

    const fetchActivity = async () => {
        if (!moduleId || !activityId) {
            setLoading(false);

            return;
        }

        setLoading(true);

        try {
            const activityData = await apiPost('/user/learner/activity/fetch/data', { activityId, moduleId });

            setData(activityData);
        } catch (error) {
            console.error('Activity Fetch Error:', error);
            toast.error(error?.message || 'Could not load activity');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ready) return;

        fetchActivity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, activityId, moduleId]);

    /* ------------------------------------------------------------------ */
    /* Save helpers — every one RETURNS the API data (no res.ok anywhere)  */
    /* ------------------------------------------------------------------ */

    const applySurveyState = result => {
        const shouldOpen = Boolean(result?.is_survey_completed && result?.completed);

        setSurveyModalOpen(shouldOpen);

        return shouldOpen;
    };

    const handleSaveScormData = async payload => {
        const result = await apiPost('/user/learner/save/scorm-data', { ...payload, ...baseIds });

        applySurveyState(result);

        return result;
    };

    const saveFieldData = async payload => {
        const result = await apiPost('/user/learner/set/report-data', { ...payload, ...baseIds });

        applySurveyState(result);

        return result;
    };

    // Quiz payload is an ARRAY, so it must be nested (spreading an array into
    // an object turns it into {0:..., 1:...} and the backend ignores it).
    const saveQuizData = async payload => {
        const result = await apiPost('/user/learner/set/report-data', { answers: payload, ...baseIds });

        applySurveyState(result);

        return result;
    };

    const saveInsertFieldData = async payload => {
        const result = await apiPost('/user/learner/insert/report-data', { ...payload, ...baseIds });

        applySurveyState(result);

        return result;
    };

    const saveInsertQuizData = async payload => {

        const payloadFinalData = { answers: payload, ...baseIds }

        console.log("payload", payloadFinalData);

        const result = await apiPost('/user/learner/insert/report-data', payloadFinalData);

        console.log("Result", result);


        applySurveyState(result);

        return result;
    };

    const saveAttempt = async () => {
        await apiPost('/user/learner/activity/attempt-check', baseIds);
    };

    /* ------------------------------------------------------------------ */
    /* Autosave effects                                                    */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        if (!ready) return;

        const changed =
            fieldData.currentPage ||
            fieldData.currentVideoTime ||
            (fieldData.viewedPages && fieldData.viewedPages.length > 0);

        if (!changed) return;

        if (fieldAutosaveTimer.current) clearTimeout(fieldAutosaveTimer.current);

        fieldAutosaveTimer.current = setTimeout(() => {
            saveFieldData(fieldData).catch(err => console.warn('Field autosave failed', err));
        }, 800);

        return () => {
            if (fieldAutosaveTimer.current) clearTimeout(fieldAutosaveTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        ready,
        fieldData.currentPage,
        fieldData.currentVideoTime,
        (fieldData.viewedPages || []).length,
        fieldData.totalPages,
        fieldData.totalVideoTime
    ]);

    useEffect(() => {
        if (!ready) return;
        if (!Array.isArray(quizData) || quizData.length === 0) return;

        if (quizAutosaveTimer.current) clearTimeout(quizAutosaveTimer.current);

        quizAutosaveTimer.current = setTimeout(() => {
            saveQuizData(quizData).catch(err => console.warn('Quiz autosave failed', err));
        }, 1200);

        return () => {
            if (quizAutosaveTimer.current) clearTimeout(quizAutosaveTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, quizData]);

    useEffect(() => {
        if (!ready) return;
        if (Object.keys(scormData).length === 0) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            handleSaveScormData(scormData).catch(err => console.error('SCORM save failed', err));
        }, 800);

        return () => clearTimeout(saveTimeout.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, scormData, moduleId, contentFolderId, activityId, moduleTypeId]);

    /* ------------------------------------------------------------------ */
    /* Derived values                                                      */
    /* ------------------------------------------------------------------ */

    const fileUrl = data?.document_data?.image_url ? `${ASSET_URL}/activity/${data.document_data.image_url}` : null;
    const videoURL = data?.video_data?.video_url ? `${ASSET_URL}/activity/${data.video_data.video_url}` : null;
    const youtubeVideoURL = data?.video_data?.video_url;
    const extension = data?.document_data?.image_url?.split('.').pop()?.toLowerCase();
    const scromLogData = data?.logs?.[0]?.scorm_data || {};

    const isPDF = extension === 'pdf';
    const isOfficeDoc = ['ppt', 'pptx', 'doc', 'docx'].includes(extension);

    const handlePageChange = (current, total) => {
        setPageInfo({ current, total });
        setFieldData(prev => ({
            ...prev,
            currentPage: current,
            totalPages: total,
            viewedPages: Array.from(new Set([...(prev.viewedPages || []), current]))
        }));
    };

    const isCompletedCondition =
        (data?.logs?.[0]?.completion_percentage || 0) >= 100 ||
        (fieldData.totalPages > 0 && fieldData.viewedPages.length === fieldData.totalPages) ||
        (fieldData.totalVideoTime > 0 && fieldData.viewedVideoTime >= fieldData.totalVideoTime) ||
        (data?.questions?.length > 0 && quizData.length === data.questions.length);

    /* ------------------------------------------------------------------ */
    /* Actions                                                             */
    /* ------------------------------------------------------------------ */

    const handleStartExam = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn('Fullscreen request failed', err);
        }

        try {
            await saveAttempt();
            setInstruction(true);
        } catch (err) {
            console.error('Attempt check failed', err);
            toast.error(err?.message || 'Could not start the exam');
        }
    };

    const handleMarkComplete = async () => {
        setOpenConfirm(false);

        try {
            // apiPost throws on any non-2xx response, so no `res.ok` check is needed.
            const values =
                quizData.length > 0
                    ? await saveInsertQuizData(quizData)
                    : await saveInsertFieldData(fieldData);

            toast.success('Activity completed successfully', { autoClose: 1000 });

            // If the survey modal is opening, keep the window open so the learner can fill it in.
            if (values?.is_survey_completed && values?.completed) return;

            closeWindow();
        } catch (err) {
            console.error('handleMarkComplete error', err);
            toast.error(err?.message || 'Could not mark activity complete');
        }
    };

    /* ------------------------------------------------------------------ */
    /* Leaving the page                                                    */
    /* ------------------------------------------------------------------ */

    const endActivityUrl = `${API_URL}/user/learner/activity/end-attempt`;

    const endActivity = () => {

        console.log("Data tried", token, isLeavingRef.current);

        if (!token || isLeavingRef.current) return;

        console.log("Data 7", token, isLeavingRef.current);

        isLeavingRef.current = true;

        try {
            const blob = new Blob([JSON.stringify({ ...baseIds, token })], { type: 'application/json' });


            console.log("Data 8", token, isLeavingRef.current);

            navigator.sendBeacon(endActivityUrl, blob);
        } catch (err) {
            console.error('Failed to end activity', err);
        }
    };

    useEffect(() => {
        if (!token && !ready) return;

        const handleBeforeUnload = event => {
            endActivity();
            event.preventDefault();
            event.returnValue = '';
        };

        beforeUnloadHandlerRef.current = handleBeforeUnload;

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, ready]);

    useEffect(() => {
        if (!token || typeof window === 'undefined' || !ready) return;

        initialUrlRef.current = window.location.href;

        window.history.pushState({ guard: true }, '', window.location.href);

        const handlePopState = () => {
            const leave = window.confirm('Do you want to leave this page?');

            if (!leave) {
                window.history.pushState({ guard: true }, '', initialUrlRef.current);

                return;
            }

            endActivity();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, ready]);

    useEffect(() => {
        if (isQuizClose) closeWindow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isQuizClose]);

    const disableBlur = types === 'youtube-video' || types === 'scrom-content';

    const quizStartDisabled =
        data?.QuizSetting?.[0]?.reattempts != -1 &&
        quizData?.length > 0 &&
        (data?.logs?.[0] ? !data?.logs?.[0]?.is_reattempt_left : false);

    /* ------------------------------------------------------------------ */
    /* Render                                                              */
    /* ------------------------------------------------------------------ */

    return (
        <Box
            sx={{
                p: { xs: 1, sm: 2, md: 3 },
                userSelect: 'none',
                WebkitUserSelect: 'none',
                filter: blurred && !disableBlur ? 'blur(20px)' : 'none',
                pointerEvents: blurred && !disableBlur ? 'none' : 'auto'
            }}
        >
            {!ready ? (
                <Skeleton height={200} />
            ) : (
                <Card>
                    <CardHeader
                        title={
                            <>
                                {loading ? (
                                    <Skeleton width='60%' height={40} />
                                ) : (
                                    <Typography variant='h4' fontWeight='bold' gutterBottom color='primary'>
                                        {data?.name || moduleTypeLabel?.[moduleTypeId] || 'Objective Quiz'} {types}
                                    </Typography>
                                )}

                                {!loading && pageInfo.total > 0 && (isPDF || isOfficeDoc) && (
                                    <Typography variant='body2' sx={{ color: 'primary.main', fontWeight: 500, mb: 1 }}>
                                        Page {pageInfo.current} of {pageInfo.total}
                                    </Typography>
                                )}
                            </>
                        }
                    />

                    <CardContent>
                        <Box
                            sx={{
                                height: { xs: '45vh', sm: '50vh', md: '60vh' },
                                p: { xs: 0.5, sm: 1 }
                            }}
                        >
                            {loading ? (
                                <>
                                    <Skeleton height={200} />
                                    <Skeleton height={200} sx={{ mt: 2 }} />
                                </>
                            ) : (
                                <>
                                    {types === 'pdf' && isPDF && (
                                        <PDFViewer
                                            pdfUrl={fileUrl}
                                            onPageChange={handlePageChange}
                                            setFieldData={setFieldData}
                                            pageData={data?.logs?.[0]}
                                            setSurveyModalOpen={setSurveyModalOpen}
                                        />
                                    )}
                                    {(extension === 'doc' || extension === 'docx') && (
                                        <DocViewer
                                            fileUrl={fileUrl}
                                            onPageLoad={handlePageChange}
                                            setFieldData={setFieldData}
                                            pageData={data?.logs?.[0]}
                                            setSurveyModalOpen={setSurveyModalOpen}
                                        />
                                    )}
                                    {(extension === 'ppt' || extension === 'pptx') && (
                                        <PptViewer
                                            fileUrl={fileUrl}
                                            onPageLoad={handlePageChange}
                                            setFieldData={setFieldData}
                                            pageData={data?.logs?.[0]}
                                            setSurveyModalOpen={setSurveyModalOpen}
                                        />
                                    )}
                                    {(types === 'video' || types === 'youtube-video') && (
                                        <YouTubePlayerComponent
                                            url={types === 'video' ? videoURL : youtubeVideoURL}
                                            setFieldData={setFieldData}
                                            pageData={data?.logs?.[0]}
                                            setSurveyModalOpen={setSurveyModalOpen}
                                        />
                                    )}
                                    {types === 'quiz' && (
                                        <QuizQuestionComponent
                                            log={data}
                                            isInstruction={isInstruction}
                                            setInstruction={setInstruction}
                                            status={false}
                                            quizSetting={data?.QuizSetting?.[0] || {}}
                                            data={data?.questions || []}
                                            report={data?.quiz_reports || []}
                                            setQuizData={setQuizData}
                                            saveInsertQuizData={saveInsertQuizData}
                                            setSurveyModalOpen={setSurveyModalOpen}
                                            setIsQuizClose={setIsQuizClose}
                                        />
                                    )}
                                    {types === 'scrom-content' && (
                                        <ScromContentComponent
                                            data={data}
                                            scormData={scormData}
                                            scromLogData={scromLogData}
                                            setScormData={setScormData}
                                            setSurveyModalOpen={setSurveyModalOpen}
                                        />
                                    )}
                                </>
                            )}
                        </Box>

                        {!loading && types !== 'quiz' && types !== 'scrom-content' && (
                            <Box
                                sx={{
                                    backgroundColor: '#e8f1ff',
                                    border: '1px solid #c5d7ff',
                                    padding: 2,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mt: 2
                                }}
                            >
                                In order to complete the activity it is mandatory to click on
                                <strong>Mark As Complete</strong> after you have finished.
                            </Box>
                        )}
                    </CardContent>

                    <CardActions sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 6 }}>
                        {!isInstruction &&
                            types === 'quiz' &&
                            (data?.QuizSetting?.[0]?.reattempts == -1 || !quizStartDisabled ? (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={quizStartDisabled}
                                    onClick={handleStartExam}
                                >
                                    Start Exam
                                </Button>
                            ) : (
                                <>No attempt left</>
                            ))}

                        {types !== 'quiz' && isCompletedCondition && (
                            <Button
                                variant='contained'
                                color='primary'
                                disabled={data?.logs?.[0]?.is_completed}
                                onClick={() => setOpenConfirm(true)}
                            >
                                Mark as complete
                            </Button>
                        )}

                        <Button
                            variant='outlined'
                            color='secondary'
                            onClick={() => {

                                endActivity();
                                closeWindow();
                            }}
                        >
                            Exit
                        </Button>
                    </CardActions>
                </Card>
            )}

            <SurveyModalComponent open={surveyModalOpen} setOpen={setSurveyModalOpen} moduleId={moduleId} />

            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
            >
                <DialogCloseButton onClick={() => setOpenConfirm(false)}>
                    <i className='tabler-x' />
                </DialogCloseButton>
                <DialogTitle>Confirm Completion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to mark this activity as complete?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color='secondary'>
                        Cancel
                    </Button>
                    <Button onClick={handleMarkComplete} color='primary' variant='contained'>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ContentData;
