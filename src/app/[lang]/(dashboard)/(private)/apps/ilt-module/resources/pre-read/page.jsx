"use client"

import React, { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

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

const LearnerPreReadPage = () => {
    const { lang } = useParams();

    const searchParams = useSearchParams();
    const router = useRouter();

    const batchId = searchParams?.get('batchId');
    const sessionId = searchParams?.get('sessionId');
    const moduleId = searchParams?.get('moduleId');
    const contentFolderId = searchParams?.get('contentFolderId');

    const qs = `?batchId=${batchId}&sessionId=${sessionId}&moduleId=${moduleId}&contentFolderId=${contentFolderId}`;

    const { data: authSession } = useSession();
    const token = authSession?.user?.token;

    const { ready, apiGet, apiPost } = useApi();

    const [items, setItems] = useState([]);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFoundState, setNotFoundState] = useState(false);
    const [settingData, setSettingData] = useState();

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiGet(
                `/user/learner/resource/pre-read?batchId=${batchId}&moduleId=${moduleId}&sessionId=${sessionId}`
            );

            // API says learner is not allowed to access this resource
            if (!data?.isAllowed) {
                setNotFoundState(true);
                
                return;
            }

            setItems(data.items || []);

        } catch (err) {
            console.error("Failed to fetch pre-read:", err);

            setError(err?.message || "Unable to load pre-read materials.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

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

    // Survey/settings
    const fetchSurveyData = async () => {
        try {
            const surveyData = await apiGet(
                `/user/module/survey/data/${moduleId}`
            );

            setSettingData({
                orderType: surveyData?.module_setting?.orderType || 'any'
            });
        } catch (err) {
            console.error("Failed to fetch survey settings:", err);
        }
    };

    useEffect(() => {
        if (!ready || !token || !moduleId) return;

        fetchSurveyData();
    }, [ready, token, moduleId]);

    // Client only
    if (!isClient) {
        return null;
    }

    // Missing/invalid resource
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

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Container maxWidth="xl">
                    <Skeleton variant="rounded" height={200} />
                </Container>
            </Box>
        );
    }

    const completedCount = items.filter((i) => i.done).length;

    const progress = items.length
        ? Math.round((completedCount / items.length) * 100)
        : 0;

    // ...your existing return JSX
};

export default LearnerPreReadPage;
