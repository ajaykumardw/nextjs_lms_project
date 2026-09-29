"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useParams, useSearchParams, notFound } from "next/navigation";
import Link from "next/link";

import { toast } from "react-toastify";

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
    Alert,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import PermissionGuard from "@/hocs/PermissionClientGuard";
import { useApi } from "@/hooks/useApi";
import { getLocalizedUrl } from "@/utils/i18n";

const SCORM_TYPE_ID = "688723af5dd97f4ccae68837";

const docType = {
    "688723af5dd97f4ccae68834": "pdf",
    "688723af5dd97f4ccae68835": "video",
    "688723af5dd97f4ccae68836": "youtube-video",
    [SCORM_TYPE_ID]: "scorm-content",
    "688723af5dd97f4ccae68838": "web-link",
    "688723af5dd97f4ccae68839": "subjective-assessment",
    "688723af5dd97f4ccae6883a": "flash-card",
    "68886902954c4d9dc7a379bd": "quiz",
};

const iconByModuleType = {
    "688723af5dd97f4ccae68834": "tabler-file-type-pdf",
    "688723af5dd97f4ccae68835": "tabler-video",
    "688723af5dd97f4ccae68836": "tabler-brand-youtube",
    [SCORM_TYPE_ID]: "tabler-package",
    "688723af5dd97f4ccae68838": "tabler-link",
    "688723af5dd97f4ccae68839": "tabler-file-text",
    "688723af5dd97f4ccae6883a": "tabler-cards",
    "68886902954c4d9dc7a379bd": "tabler-help-circle",
};

const fileIcon = (item) =>
    iconByModuleType[item?.module_type_id] || "tabler-file";

const LearnerPostReadPage = () => {
    const { lang } = useParams();
    const searchParams = useSearchParams();

    const batchId = searchParams?.get("batchId");
    const sessionId = searchParams?.get("sessionId");
    const moduleId = searchParams?.get("moduleId");
    const contentFolderId = searchParams?.get("contentFolderId");

    const { ready, apiGet, apiPost } = useApi();

    const [items, setItems] = useState([]);
    const [isAllowed, setIsAllowed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderType, setOrderType] = useState("any");

    const hasRequiredParams =
        Boolean(batchId) &&
        Boolean(sessionId) &&
        Boolean(moduleId) &&
        Boolean(contentFolderId);

    useEffect(() => {
        if (!ready || !hasRequiredParams) {
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const [postReadData, surveyData] =
                    await Promise.all([
                        apiGet(`/user/learner/resource/post-read?batchId=${(batchId)}&moduleId=${(moduleId)}&sessionId=${(sessionId)}`),

                        apiGet(`/user/module/survey/data/${encodeURIComponent(moduleId)}`),
                    ]);

                if (cancelled) {
                    return;
                }

                setItems(
                    Array.isArray(postReadData?.items)
                        ? postReadData.items
                        : []
                );

                setIsAllowed(
                    postReadData?.isAllowed === true
                );

                setOrderType(
                    surveyData?.module_setting?.orderType ||
                    "any"
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load post-read data:",
                    err
                );

                setError(
                    err?.message ||
                    "Failed to load materials."
                );

                setItems([]);
                setIsAllowed(false);
                setOrderType("any");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };

    }, [
        ready,
        batchId,
        moduleId,
        sessionId,
        hasRequiredParams,
    ]);

    if (ready && !hasRequiredParams) {
        notFound();
    }

    if (
        ready &&
        !loading &&
        isAllowed === false
    ) {
        notFound();
    }

    const completedCount = useMemo(() => {
        return items.filter(
            (item) => Boolean(item?.done)
        ).length;
    }, [items]);

    const progress = useMemo(() => {
        if (!items.length) {
            return 0;
        }

        return Math.round(
            (completedCount / items.length) * 100
        );
    }, [completedCount, items.length]);

    const handleStartActivity = async (
        activityId,
        moduleTypeId
    ) => {
        return apiPost(
            "/user/learner/activity/new-attempt",
            {
                moduleId,
                contentFolderId,
                activityId,
                moduleTypeId,
                batchId,
                sessionId,
            }
        );
    };

    /*
     * Open activity.
     */
    const handleOpen = async (
        canOpen,
        url,
        activityId,
        moduleTypeId
    ) => {
        if (!canOpen) {

            toast.error(
                "Please complete the previous activity first.",
                {
                    autoClose: 1000,
                }
            );

            return;
        }

        const newWindow = window.open(
            "",
            "_blank",
            `width = ${window.screen.availWidth}, height = ${window.screen.availHeight}, toolbar = 1, location = 0, scrollbars = no, resizable = no`
        );

        if (!newWindow) {

            toast.error("Popup blocked. Please allow popups for this site.");

            return;
        }

        try {

            await handleStartActivity(activityId, moduleTypeId);

            newWindow.location.href = url;
        } catch (err) {

            console.error("Unable to start activity:", err);
            newWindow.close();
            toast.error("Unable to start activity.");
        }
    };

    return (
        <PermissionGuard
            element="isUser"
            locale={lang}
        >
            <Box
                sx={{
                    bgcolor: "#f8fafc",
                    minHeight: "100vh",
                    py: 4,
                    px: {
                        xs: 2,
                        md: 4,
                    },
                }}
            >
                <Container maxWidth="xl">

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Button
                        component={Link}
                        variant="outlined"
                        href={
                            batchId
                                ? `/${lang}/apps/ilt-module/batch-session/${batchId} `
                                : `/${lang}/apps/ilt-module/batch-list`
                        }
                        startIcon={
                            <i className="tabler-arrow-left text-lg" />
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            mb: 3,
                        }}
                    >
                        Back to Sessions
                    </Button>

                    <Card
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight="700"
                            sx={{ mb: 1 }}
                        >
                            Post-Read Materials
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Resources to review after the
                            session to reinforce what was
                            covered.
                        </Typography>

                        <Box sx={{ mb: 4 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="600"
                                >
                                    Your Progress
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {completedCount} of{" "}
                                    {items.length} completed
                                </Typography>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                }}
                            />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {loading ? (
                            <Skeleton
                                variant="rounded"
                                height={200}
                            />
                        ) : (
                            <Grid
                                container
                                spacing={2.5}
                            >
                                {items.length === 0 && (
                                    <Grid size={12}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            No post-read materials
                                            shared yet.
                                        </Typography>
                                    </Grid>
                                )}

                                {items.map(
                                    (item, index) => {
                                        const moduleTypeId =
                                            item?.module_type_id;

                                        const isCompleted =
                                            Boolean(
                                                item?.done
                                            );

                                        /*
                                         * Previous activity.
                                         */
                                        const prevActivity =
                                            items[index - 1];

                                        const prevLog =
                                            prevActivity
                                                ?.logs?.[0];

                                        /*
                                         * SCORM status.
                                         */
                                        const previousScormStatus =
                                            String(
                                                prevLog
                                                    ?.scorm_data
                                                    ?.lessonStatus ||
                                                ""
                                            ).toLowerCase();

                                        /*
                                         * Determine whether
                                         * previous activity
                                         * is completed.
                                         */
                                        const prevCompleted =
                                            Boolean(
                                                prevActivity?.done
                                            ) ||
                                            Boolean(
                                                prevLog?.done &&
                                                Number(
                                                    prevLog?.completion_percentage
                                                ) >= 100
                                            ) ||
                                            [
                                                "passed",
                                                "completed",
                                                "complete",
                                            ].includes(
                                                previousScormStatus
                                            );

                                        /*
                                         * Ordered activities:
                                         *
                                         * First activity:
                                         * always available.
                                         *
                                         * Following activities:
                                         * require previous
                                         * activity completion.
                                         */
                                        const canOpen =
                                            orderType !==
                                            "ordered" ||
                                            index === 0 ||
                                            prevCompleted;

                                        /*
                                         * Completed SCORM cannot
                                         * be started again.
                                         */
                                        const isDisabled =
                                            isCompleted &&
                                            moduleTypeId ===
                                            SCORM_TYPE_ID;

                                        /*
                                         * Button label.
                                         */
                                        let buttonLabel =
                                            "Start";

                                        if (
                                            isCompleted
                                        ) {
                                            buttonLabel =
                                                "Completed";
                                        } else if (
                                            !canOpen
                                        ) {
                                            buttonLabel =
                                                "Locked";
                                        } else if (
                                            item?.logs
                                                ?.length
                                        ) {
                                            buttonLabel =
                                                "In Progress";
                                        }

                                        /*
                                         * Activity URL.
                                         */
                                        const activityPath = `/ilt-activity?type=${encodeURIComponent(docType[moduleTypeId] || "unknown")}&activityId=${encodeURIComponent(item?.id || "")}&moduleId=${encodeURIComponent(moduleId)}& contentFolderId=${encodeURIComponent(contentFolderId)}&moduleTypeId=${encodeURIComponent(moduleTypeId)}&batchId=${encodeURIComponent(batchId)}&sessionId=${encodeURIComponent(sessionId)} `;

                                        const activityUrl = typeof window !== "undefined" ? window.location.origin + getLocalizedUrl(activityPath, lang) : "";

                                        return (
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6,
                                                }}
                                                key={
                                                    item?.id ||
                                                    index
                                                }
                                            >
                                                <Box
                                                    sx={{
                                                        p: 2.5,
                                                        borderRadius: 2.5,
                                                        border: "1px solid",
                                                        borderColor:
                                                            isCompleted
                                                                ? "success.main"
                                                                : "divider",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "space-between",
                                                        gap: 2,
                                                        height: "100%",
                                                        opacity:
                                                            canOpen
                                                                ? 1
                                                                : 0.6,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1.5,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                bgcolor:
                                                                    "primary.lighter",
                                                                color:
                                                                    "primary.main",
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            <i
                                                                className={`${fileIcon(
                                                                    item
                                                                )
                                                                    } text - xl`}
                                                            />
                                                        </Avatar>

                                                        <Box
                                                            sx={{
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight="700"
                                                                noWrap
                                                                sx={{
                                                                    textDecoration:
                                                                        isCompleted
                                                                            ? "line-through"
                                                                            : "none",
                                                                    color:
                                                                        isCompleted
                                                                            ? "text.secondary"
                                                                            : "text.primary",
                                                                }}
                                                            >
                                                                {
                                                                    item?.title
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    item?.type
                                                                }{" "}
                                                                ·{" "}
                                                                {isCompleted
                                                                    ? "Completed by you"
                                                                    : "Not completed"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Button
                                                        variant="contained"
                                                        color={
                                                            isCompleted
                                                                ? "success"
                                                                : "primary"
                                                        }
                                                        disabled={
                                                            isDisabled ||
                                                            !canOpen
                                                        }
                                                        onClick={() =>
                                                            handleOpen(
                                                                canOpen,
                                                                activityUrl,
                                                                item?.id,
                                                                moduleTypeId
                                                            )
                                                        }
                                                        sx={{
                                                            textTransform:
                                                                "none",
                                                            height: 32,
                                                            px: 2,
                                                            fontSize:
                                                                "0.75rem",
                                                            borderRadius: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {
                                                            buttonLabel
                                                        }
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        );
                                    }
                                )}
                            </Grid>
                        )}
                    </Card>
                </Container>
            </Box>
        </PermissionGuard>
    );
};

export default LearnerPostReadPage;
