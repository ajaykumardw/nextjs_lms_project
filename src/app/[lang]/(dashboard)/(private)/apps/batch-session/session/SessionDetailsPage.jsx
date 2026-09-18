"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Avatar,
    Typography,
    Tabs,
    Tab,
    Stack,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Alert,
    Paper,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

const sessionData = {
    id: "sess_02",
    batchId: "batch_101",
    batchName: "Enterprise Leadership - Batch A",
    title: "Session 2: Empathy in Leadership Teams",
    date: "14 Oct 2026",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    venue: "Virtual HQ Room 3",
    trainer: "Dr. Sarah Jenkins",
    status: "Upcoming",

    learners: {
        total: 150,
        present: 132,
        late: 8,
        absent: 6,
        pending: 4,
    },

    preRead: {
        total: 3,
        completed: 132,
        pending: 18,
    },

    materials: 5,

    postRead: {
        assignments: 2,
        submissions: 124,
        pending: 26,
    },

    notes: {
        saved: false,
    },
};

const SessionDetailsPage = () => {
    const { lang, batchId, sessionId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTab = searchParams.get("tab") || "overview";
    const [tab, setTab] = useState(initialTab);

    const attendancePercentage = useMemo(() => {
        return Math.round(
            (sessionData.learners.present / sessionData.learners.total) * 100
        );
    }, []);

    const goTo = (url) => {
        router.push(url);
    };

    const sessionBase =
        `/${lang}/apps/batch-session/batches/${batchId}/sessions/${sessionId}`;

    return (
        <Box
            sx={{
                bgcolor: "#f8fafc",
                minHeight: "100vh",
                p: { xs: 2, md: 4 },
            }}
        >
            <Box sx={{ maxWidth: 1500, mx: "auto" }}>

                {/* Back */}
                <Button
                    startIcon={<i className="tabler-arrow-left" />}
                    onClick={() =>
                        router.push(
                            `/${lang}/apps/batch-session/batches/${batchId}`
                        )
                    }
                    sx={{
                        mb: 2,
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    Back to Batch
                </Button>

                {/* Header */}
                <Card
                    elevation={0}
                    sx={{
                        p: { xs: 2.5, md: 4 },
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    mb: 1.5,
                                }}
                            >
                                <Chip
                                    label={sessionData.status}
                                    color="warning"
                                    size="small"
                                />

                                <Chip
                                    label={sessionData.batchName}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ mb: 1 }}
                            >
                                {sessionData.title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {sessionData.date} &nbsp;•&nbsp;
                                {sessionData.startTime} - {sessionData.endTime}
                                &nbsp;•&nbsp;
                                {sessionData.venue}
                            </Typography>
                        </Box>

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Button
                                variant="outlined"
                                startIcon={
                                    <i className="tabler-users" />
                                }
                                onClick={() =>
                                    goTo(
                                        `${sessionBase}/learners`
                                    )
                                }
                            >
                                Learners
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={
                                    <i className="tabler-calendar-check" />
                                }
                                onClick={() =>
                                    goTo(
                                        `${sessionBase}/attendance`
                                    )
                                }
                            >
                                Attendance
                            </Button>
                        </Stack>
                    </Box>
                </Card>

                {/* Quick Stats */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon="tabler-users"
                            title="Learners"
                            value={sessionData.learners.total}
                            subtitle="Enrolled"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon="tabler-user-check"
                            title="Attendance"
                            value={`${attendancePercentage}%`}
                            subtitle={`${sessionData.learners.present} present`}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon="tabler-book"
                            title="Pre-read"
                            value={`${sessionData.preRead.completed}/${sessionData.learners.total}`}
                            subtitle="Learners completed"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            icon="tabler-clipboard-text"
                            title="Post-read"
                            value={sessionData.postRead.pending}
                            subtitle="Pending submissions"
                        />
                    </Grid>

                </Grid>

                {/* Main Content */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                    }}
                >
                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(e, value) => setTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            px: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Tab value="overview" label="Overview" />
                        <Tab value="learners" label="Learners" />
                        <Tab value="attendance" label="Attendance" />
                        <Tab value="pre-read" label="Pre-read" />
                        <Tab value="materials" label="Materials" />
                        <Tab value="post-read" label="Post-read" />
                        <Tab value="notes" label="Session Notes" />
                    </Tabs>

                    <Box sx={{ p: { xs: 2, md: 3 } }}>

                        {tab === "overview" && (
                            <OverviewTab
                                sessionBase={sessionBase}
                                goTo={goTo}
                                attendancePercentage={
                                    attendancePercentage
                                }
                            />
                        )}

                        {tab === "learners" && (
                            <LearnersTab
                                sessionBase={sessionBase}
                                goTo={goTo}
                            />
                        )}

                        {tab === "attendance" && (
                            <AttendanceTab
                                sessionBase={sessionBase}
                                goTo={goTo}
                            />
                        )}

                        {tab === "pre-read" && (
                            <PreReadTab
                                sessionBase={sessionBase}
                                goTo={goTo}
                            />
                        )}

                        {tab === "materials" && (
                            <MaterialsTab
                                sessionBase={sessionBase}
                                goTo={goTo}
                            />
                        )}

                        {tab === "post-read" && (
                            <PostReadTab
                                sessionBase={sessionBase}
                                goTo={goTo}
                            />
                        )}

                        {tab === "notes" && <NotesTab />}

                    </Box>
                </Card>
            </Box>
        </Box>
    );
};

const StatCard = ({
    icon,
    title,
    value,
    subtitle,
}) => (
    <Card
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
        }}
    >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar
                sx={{
                    borderRadius: 2,
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                }}
            >
                <i className={`${icon} text-xl`} />
            </Avatar>

            <Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {title}
                </Typography>

                <Typography variant="h5" fontWeight={700}>
                    {value}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    </Card>
);

const OverviewTab = ({
    sessionBase,
    goTo,
    attendancePercentage,
}) => {
    return (
        <Grid container spacing={3}>

            <Grid size={{ xs: 12, md: 8 }}>
                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h6" fontWeight={700}>
                        Session Overview
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>

                        <InfoItem
                            label="Trainer"
                            value="Dr. Sarah Jenkins"
                        />

                        <InfoItem
                            label="Date"
                            value="14 Oct 2026"
                        />

                        <InfoItem
                            label="Time"
                            value="02:00 PM - 04:00 PM"
                        />

                        <InfoItem
                            label="Venue"
                            value="Virtual HQ Room 3"
                        />

                    </Grid>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h6" fontWeight={700}>
                        Session Progress
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Attendance
                        </Typography>

                        <Typography variant="h6" fontWeight={700}>
                            {attendancePercentage}%
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={attendancePercentage}
                            sx={{
                                mt: 1,
                                height: 8,
                                borderRadius: 5,
                            }}
                        />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Pre-read completion
                        </Typography>

                        <Typography variant="h6" fontWeight={700}>
                            88%
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={88}
                            sx={{
                                mt: 1,
                                height: 8,
                                borderRadius: 5,
                            }}
                        />
                    </Box>
                </Card>
            </Grid>

            <Grid size={12}>
                <Alert
                    severity="info"
                    icon={<i className="tabler-info-circle" />}
                >
                    This session is scheduled for today. Make sure
                    attendance is recorded before completing the session.
                </Alert>
            </Grid>

            <Grid size={12}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ mb: 2 }}
                >
                    Quick Actions
                </Typography>

                <Grid container spacing={2}>

                    <ActionCard
                        icon="tabler-calendar-check"
                        title="Attendance"
                        description="Mark and manage learner attendance"
                        onClick={() =>
                            goTo(`${sessionBase}/attendance`)
                        }
                    />

                    <ActionCard
                        icon="tabler-users"
                        title="Learners"
                        description="View learners assigned to this session"
                        onClick={() =>
                            goTo(`${sessionBase}/learners`)
                        }
                    />

                    <ActionCard
                        icon="tabler-book"
                        title="Pre-read"
                        description="Review learner pre-read progress"
                        onClick={() =>
                            goTo(
                                `/${window.location.pathname.split("/")[1]}/apps/batch-session/resource/pre-read?batchId=${sessionData.batchId}&sessionId=${sessionData.id}`
                            )
                        }
                    />

                    <ActionCard
                        icon="tabler-file-text"
                        title="Post-read"
                        description="Review assignments and submissions"
                        onClick={() =>
                            goTo(
                                `/${window.location.pathname.split("/")[1]}/apps/batch-session/resource/post-read?batchId=${sessionData.batchId}&sessionId=${sessionData.id}`
                            )
                        }
                    />

                </Grid>
            </Grid>
        </Grid>
    );
};

const InfoItem = ({ label, value }) => (
    <Grid size={{ xs: 12, sm: 6 }}>
        <Typography
            variant="caption"
            color="text.secondary"
        >
            {label}
        </Typography>

        <Typography
            variant="body1"
            fontWeight={600}
        >
            {value}
        </Typography>
    </Grid>
);

const ActionCard = ({
    icon,
    title,
    description,
    onClick,
}) => (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper
            onClick={onClick}
            elevation={0}
            sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                cursor: "pointer",
                height: "100%",
                transition: "0.2s",
                "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <Avatar
                sx={{
                    mb: 2,
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                    borderRadius: 2,
                }}
            >
                <i className={icon} />
            </Avatar>

            <Typography fontWeight={700}>
                {title}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
            >
                {description}
            </Typography>
        </Paper>
    </Grid>
);

const LearnersTab = ({ sessionBase, goTo }) => (
    <Box>
        <PageHeading
            title="Session Learners"
            subtitle="Learners assigned to this training session"
        />

        <Grid container spacing={2} sx={{ mb: 3 }}>
            <MiniStat title="Total Learners" value="150" />
            <MiniStat title="Present" value="132" />
            <MiniStat title="Attendance Pending" value="18" />
            <MiniStat title="Completion" value="78%" />
        </Grid>

        <Button
            variant="contained"
            startIcon={<i className="tabler-users" />}
            onClick={() => goTo(`${sessionBase}/learners`)}
        >
            Open Learner Roster
        </Button>
    </Box>
);

const AttendanceTab = ({ sessionBase, goTo }) => (
    <Box>
        <PageHeading
            title="Attendance"
            subtitle="Record attendance for this session"
        />

        <Grid container spacing={2} sx={{ mb: 3 }}>
            <MiniStat title="Present" value="132" />
            <MiniStat title="Late" value="8" />
            <MiniStat title="Absent" value="6" />
            <MiniStat title="Pending" value="4" />
        </Grid>

        <Alert severity="warning" sx={{ mb: 3 }}>
            4 learners still have no attendance status.
        </Alert>

        <Button
            variant="contained"
            startIcon={
                <i className="tabler-calendar-check" />
            }
            onClick={() =>
                goTo(`${sessionBase}/attendance`)
            }
        >
            Manage Attendance
        </Button>
    </Box>
);

const PreReadTab = ({ sessionBase, goTo }) => (
    <Box>
        <PageHeading
            title="Pre-read"
            subtitle="Resources learners should review before the session"
        />

        <ResourceRow
            icon="tabler-file-text"
            title="Leadership Handbook.pdf"
            type="PDF"
            progress="88%"
            status="132 / 150 completed"
        />

        <ResourceRow
            icon="tabler-video"
            title="Empathy in Leadership.mp4"
            type="Video"
            progress="76%"
            status="114 / 150 completed"
        />

        <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() =>
                goTo(
                    `/${window.location.pathname.split("/")[1]}/apps/batch-session/resource/pre-read?batchId=${sessionData.batchId}&sessionId=${sessionData.id}`
                )
            }
        >
            Open Pre-read
        </Button>
    </Box>
);

const MaterialsTab = ({ sessionBase, goTo }) => (
    <Box>
        <PageHeading
            title="Training Materials"
            subtitle="Materials available for this session"
        />

        <ResourceRow
            icon="tabler-presentation"
            title="Empathy Workshop Presentation"
            type="Presentation"
            progress=""
            status="8.2 MB"
        />

        <ResourceRow
            icon="tabler-file-text"
            title="Facilitator Guide"
            type="PDF"
            progress=""
            status="4.1 MB"
        />

        <ResourceRow
            icon="tabler-link"
            title="Virtual Whiteboard"
            type="External Link"
            progress=""
            status="Link"
        />

        <Button
            sx={{ mt: 2 }}
            variant="contained"
            startIcon={<i className="tabler-folder-open" />}
            onClick={() =>
                goTo(
                    `/${window.location.pathname.split("/")[1]}/apps/batch-session/resource/material?batchId=${sessionData.batchId}&sessionId=${sessionData.id}`
                )
            }
        >
            Manage Materials
        </Button>
    </Box>
);

const PostReadTab = ({ sessionBase, goTo }) => (
    <Box>
        <PageHeading
            title="Post-read & Assignments"
            subtitle="Review learner assignments after the session"
        />

        <Grid container spacing={2} sx={{ mb: 3 }}>
            <MiniStat title="Assignments" value="2" />
            <MiniStat title="Submitted" value="124" />
            <MiniStat title="Pending" value="26" />
            <MiniStat title="Graded" value="110" />
        </Grid>

        <ResourceRow
            icon="tabler-clipboard-text"
            title="Leadership Reflection"
            type="Assignment"
            progress=""
            status="124 submissions"
        />

        <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() =>
                goTo(
                    `/${window.location.pathname.split("/")[1]}/apps/batch-session/resource/post-read?batchId=${sessionData.batchId}&sessionId=${sessionData.id}`
                )
            }
        >
            Open Post-read
        </Button>
    </Box>
);

const NotesTab = () => {
    const [notes, setNotes] = useState("");

    return (
        <Box>
            <PageHeading
                title="Session Notes"
                subtitle="Record trainer observations and session outcomes"
            />

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ mb: 1 }}
                    >
                        Topics Covered
                    </Typography>

                    <Stack spacing={1}>
                        {[
                            "Empathy",
                            "Active Listening",
                            "Leadership Communication",
                            "Conflict Management",
                        ].map((item) => (
                            <Paper
                                key={item}
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                }}
                            >
                                <i className="tabler-check" />
                                <Typography variant="body2">
                                    {item}
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ mb: 1 }}
                    >
                        Session Outcome
                    </Typography>

                    <Box
                        component="textarea"
                        value={notes}
                        onChange={(e) =>
                            setNotes(e.target.value)
                        }
                        placeholder="Enter session notes, learner engagement, issues and follow-up..."
                        sx={{
                            width: "100%",
                            minHeight: 180,
                            resize: "vertical",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 2,
                            fontFamily: "inherit",
                            fontSize: 14,
                            outline: "none",
                            "&:focus": {
                                borderColor: "primary.main",
                            },
                        }}
                    />
                </Grid>

                <Grid size={12}>
                    <Divider />

                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <i className="tabler-device-floppy" />
                            }
                        >
                            Save Notes
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={
                                <i className="tabler-circle-check" />
                            }
                        >
                            Complete Session
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

const PageHeading = ({ title, subtitle }) => (
    <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
            {title}
        </Typography>

        <Typography
            variant="body2"
            color="text.secondary"
        >
            {subtitle}
        </Typography>
    </Box>
);

const MiniStat = ({ title, value }) => (
    <Grid size={{ xs: 6, md: 3 }}>
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
            >
                {title}
            </Typography>

            <Typography variant="h6" fontWeight={700}>
                {value}
            </Typography>
        </Paper>
    </Grid>
);

const ResourceRow = ({
    icon,
    title,
    type,
    progress,
    status,
}) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            mb: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2.5,
        }}
    >
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Avatar
                sx={{
                    borderRadius: 2,
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                }}
            >
                <i className={icon} />
            </Avatar>

            <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>
                    {title}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {type}
                    {status ? ` • ${status}` : ""}
                </Typography>

                {progress && (
                    <LinearProgress
                        variant="determinate"
                        value={parseInt(progress)}
                        sx={{
                            mt: 1,
                            height: 6,
                            borderRadius: 5,
                        }}
                    />
                )}
            </Box>

            <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none" }}
            >
                Open
            </Button>
        </Box>
    </Paper>
);

export default SessionDetailsPage;
