"use client";

import React, { useEffect, useMemo, useState } from "react";
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
    Alert,
    Paper,
    Skeleton,
    TextField,
    Snackbar
} from "@mui/material";

import Grid from "@mui/material/Grid2";
import { useApi } from "@/hooks/useApi";

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const SessionDetailsPage = () => {

    const { lang, bId, sId } = useParams();
    const batchId = bId;
    const sessionId = sId;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready, apiGet } = useApi();

    const initialTab = searchParams.get("tab") || "overview";
    const [tab, setTab] = useState(initialTab);

    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ready || !sessionId) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);

                console.log("Data found");

                const data = await apiGet(`/user/trainer/batches/${batchId}/sessions/${sessionId}`);
                if (!cancelled) setSessionData(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [ready, batchId, sessionId]);

    const attendancePercentage = useMemo(() => {
        if (!sessionData?.learners?.total) return 0;
        return Math.round((sessionData.learners.present / sessionData.learners.total) * 100);
    }, [sessionData]);

    const preReadPercentage = useMemo(() => {
        if (!sessionData?.learners?.total) return 0;
        return Math.round((sessionData.preRead.completed / sessionData.learners.total) * 100);
    }, [sessionData]);

    const goTo = (url) => router.push(url);
    const sessionBase = `/${lang}/apps/batch-session/batches/${batchId}/sessions/${sessionId}`;

    if (loading || !sessionData) {
        return (
            <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: 1500, mx: "auto" }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Skeleton variant="rounded" height={500} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
            <Box sx={{ maxWidth: 1500, mx: "auto" }}>

                <Button
                    variant="outlined"
                    startIcon={<i className="tabler-arrow-left" />}
                    onClick={() => router.push(`/${lang}/apps/batch-session/batches/${batchId}`)}
                    sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
                >
                    Back to Batch
                </Button>

                {/* Header */}
                <Card elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                        <Box>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                                <Chip label={sessionData.session.status} color="warning" size="small" />
                                <Chip label={sessionData.session.batchName} variant="outlined" size="small" />
                            </Box>

                            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                                {sessionData.session.title}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                {formatDate(sessionData.session.date)} &nbsp;•&nbsp;
                                {sessionData.session.startTime} - {sessionData.session.endTime}
                                &nbsp;•&nbsp;
                                {sessionData.session.venue}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button variant="outlined" startIcon={<i className="tabler-users" />} onClick={() => goTo(`${sessionBase}/learners`)}>
                                Learners
                            </Button>
                            <Button variant="contained" startIcon={<i className="tabler-calendar-check" />} onClick={() => goTo(`${sessionBase}/manage-attendance`)}>
                                Attendance
                            </Button>
                        </Stack>
                    </Box>
                </Card>

                {/* Quick Stats */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon="tabler-users" title="Learners" value={sessionData.learners.total} subtitle="Enrolled" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon="tabler-user-check" title="Attendance" value={`${attendancePercentage}%`} subtitle={`${sessionData.learners.present} present`} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon="tabler-book" title="Pre-read" value={`${sessionData.preRead.completed}/${sessionData.learners.total}`} subtitle="Learners completed" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon="tabler-clipboard-text" title="Post-read" value={sessionData.postRead.pending} subtitle="Pending submissions" />
                    </Grid>
                </Grid>

                {/* Main Content */}
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                    <Tabs value={tab} onChange={(e, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
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
                                attendancePercentage={attendancePercentage}
                                preReadPercentage={preReadPercentage}
                                sessionData={sessionData}
                                lang={lang}
                            />
                        )}
                        {tab === "learners" && <LearnersTab sessionBase={sessionBase} goTo={goTo} sessionData={sessionData} />}
                        {tab === "attendance" && <AttendanceTab sessionBase={sessionBase} goTo={goTo} sessionData={sessionData} />}
                        {tab === "pre-read" && <PreReadTab sessionBase={sessionBase} goTo={goTo} sessionData={sessionData} lang={lang} batchId={batchId} sessionId={sessionId} />}
                        {tab === "materials" && <MaterialsTab goTo={goTo} sessionData={sessionData} lang={lang} batchId={batchId} sessionId={sessionId} />}
                        {tab === "post-read" && <PostReadTab sessionData={sessionData} goTo={goTo} lang={lang} batchId={batchId} sessionId={sessionId} />}
                        {tab === "notes" && <NotesTab batchId={batchId} sessionId={sessionId} />}
                    </Box>
                </Card>
            </Box>
        </Box>
    );
};

const StatCard = ({ icon, title, value, subtitle }) => (
    <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar sx={{ borderRadius: 2, bgcolor: "primary.lighter", color: "primary.main" }}>
                <i className={`${icon} text-xl`} />
            </Avatar>
            <Box>
                <Typography variant="body2" color="text.secondary">{title}</Typography>
                <Typography variant="h5" fontWeight={700}>{value}</Typography>
                <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            </Box>
        </Box>
    </Card>
);

const OverviewTab = ({ sessionBase, goTo, attendancePercentage, preReadPercentage, sessionData, lang }) => (
    <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700}>Session Overview</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    <InfoItem label="Batch" value={sessionData.session.batchName} />
                    <InfoItem label="Date" value={formatDate(sessionData.session.date)} />
                    <InfoItem label="Time" value={`${sessionData.session.startTime} - ${sessionData.session.endTime}`} />
                    <InfoItem label="Venue" value={sessionData.session.venue} />
                </Grid>
            </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700}>Session Progress</Typography>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">Attendance</Typography>
                    <Typography variant="h6" fontWeight={700}>{attendancePercentage}%</Typography>
                    <LinearProgress variant="determinate" value={attendancePercentage} sx={{ mt: 1, height: 8, borderRadius: 5 }} />
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">Pre-read completion</Typography>
                    <Typography variant="h6" fontWeight={700}>{preReadPercentage}%</Typography>
                    <LinearProgress variant="determinate" value={preReadPercentage} sx={{ mt: 1, height: 8, borderRadius: 5 }} />
                </Box>
            </Card>
        </Grid>

        <Grid size={12}>
            <Alert severity="info" icon={<i className="tabler-info-circle" />}>
                Make sure attendance is recorded before completing the session.
            </Alert>
        </Grid>

        <Grid size={12}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
                <ActionCard icon="tabler-calendar-check" title="Attendance" description="Mark and manage learner attendance" onClick={() => goTo(`${sessionBase}/manage-attendance`)} />
                <ActionCard icon="tabler-users" title="Learners" description="View learners assigned to this session" onClick={() => goTo(`${sessionBase}/learners`)} />
                <ActionCard icon="tabler-book" title="Pre-read" description="Review learner pre-read progress" onClick={() => goTo(`/${lang}/apps/batch-session/resource/pre-read?batchId=${sessionData.session.batchId}&sessionId=${sessionData.session.id}`)} />
                <ActionCard icon="tabler-file-text" title="Post-read" description="Review assignments and submissions" onClick={() => goTo(`/${lang}/apps/batch-session/resource/post-read?batchId=${sessionData.session.batchId}&sessionId=${sessionData.session.id}`)} />
            </Grid>
        </Grid>
    </Grid>
);

const InfoItem = ({ label, value }) => (
    <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight={600}>{value}</Typography>
    </Grid>
);

const ActionCard = ({ icon, title, description, onClick }) => (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper
            onClick={onClick}
            elevation={0}
            sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3, cursor: "pointer", height: "100%", transition: "0.2s", "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" } }}
        >
            <Avatar sx={{ mb: 2, bgcolor: "primary.lighter", color: "primary.main", borderRadius: 2 }}>
                <i className={icon} />
            </Avatar>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>
        </Paper>
    </Grid>
);

const LearnersTab = ({ sessionBase, goTo, sessionData }) => {
    const pending = sessionData.learners.pending;
    const completionPct = sessionData.learners.total
        ? Math.round((sessionData.learners.present / sessionData.learners.total) * 100)
        : 0;

    return (
        <Box>
            <PageHeading title="Session Learners" subtitle="Learners assigned to this training session" />
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <MiniStat title="Total Learners" value={sessionData.learners.total} />
                <MiniStat title="Present" value={sessionData.learners.present} />
                <MiniStat title="Attendance Pending" value={pending} />
                <MiniStat title="Completion" value={`${completionPct}%`} />
            </Grid>
            <Button variant="contained" startIcon={<i className="tabler-users" />} onClick={() => goTo(`${sessionBase}/learners`)}>
                Open Learner Roster
            </Button>
        </Box>
    );
};

const AttendanceTab = ({ sessionBase, goTo, sessionData }) => (
    <Box>
        <PageHeading title="Attendance" subtitle="Record attendance for this session" />
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <MiniStat title="Present" value={sessionData.learners.present} />
            <MiniStat title="Late" value={sessionData.learners.late} />
            <MiniStat title="Absent" value={sessionData.learners.absent} />
            <MiniStat title="Pending" value={sessionData.learners.pending} />
        </Grid>

        {sessionData.learners.pending > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
                {sessionData.learners.pending} learners still have no attendance status.
            </Alert>
        )}

        <Button variant="contained" startIcon={<i className="tabler-calendar-check" />} onClick={() => goTo(`${sessionBase}/manage-attendance`)}>
            Manage Attendance
        </Button>
    </Box>
);

const PreReadTab = ({ goTo, sessionData, lang, batchId, sessionId }) => {
    const { ready, apiGet } = useApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await apiGet(`/user/trainer/resource/pre-read?batchId=${batchId}&sessionId=${sessionId}`);
                if (!cancelled) setItems(data.items || []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [ready]);

    return (
        <Box>
            <PageHeading title="Pre-read" subtitle="Resources learners should review before the session" />

            {loading && <Skeleton variant="rounded" height={80} sx={{ mb: 1.5 }} />}

            {!loading && items.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No pre-read items assigned yet.</Typography>
            )}

            {items.map((item) => (
                <ResourceRow
                    key={item.id}
                    icon={item.type === "video" ? "tabler-video" : "tabler-file-text"}
                    title={item.title}
                    type={item.type}
                    progress=""
                    status={item.duration}
                />
            ))}

            <Button
                sx={{ mt: 2 }}
                variant="outlined"
                onClick={() => goTo(`/${lang}/apps/batch-session/resource/pre-read?batchId=${batchId}&sessionId=${sessionId}`)}
            >
                Open Pre-read
            </Button>
        </Box>
    );
};

const MaterialsTab = ({ goTo, lang, batchId, sessionId }) => {
    const { ready, apiGet } = useApi();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await apiGet(`/user/trainer/resource/material?batchId=${batchId}&sessionId=${sessionId}`);
                if (!cancelled) setMaterials(data.materials || []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [ready]);

    const iconFor = (type) => ({
        pdf: "tabler-file-type-pdf",
        slides: "tabler-presentation",
        video: "tabler-video",
        link: "tabler-link",
    }[type] || "tabler-file");

    return (
        <Box>
            <PageHeading title="Training Materials" subtitle="Materials available for this session" />

            {loading && <Skeleton variant="rounded" height={80} sx={{ mb: 1.5 }} />}

            {!loading && materials.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No materials uploaded yet.</Typography>
            )}

            {materials.map((mat) => (
                <ResourceRow
                    key={mat._id}
                    icon={iconFor(mat.type)}
                    title={mat.title}
                    type={mat.type}
                    progress=""
                    status={mat.file_size ? `${(mat.file_size / 1024 / 1024).toFixed(1)} MB` : "—"}
                />
            ))}

            <Button
                sx={{ mt: 2 }}
                variant="contained"
                startIcon={<i className="tabler-folder-open" />}
                onClick={() => goTo(`/${lang}/apps/batch-session/resource/training-material?batchId=${batchId}&sessionId=${sessionId}`)}
            >
                Manage Materials
            </Button>
        </Box>
    );
};

const PostReadTab = ({ sessionData, goTo, lang, batchId, sessionId }) => {
    const { ready, apiGet } = useApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await apiGet(`/user/trainer/resource/post-read?batchId=${batchId}&sessionId=${sessionId}`);
                if (!cancelled) setItems(data.items || []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [ready]);

    return (
        <Box>
            <PageHeading title="Post-read & Assignments" subtitle="Review learner assignments after the session" />

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <MiniStat title="Assignments" value={sessionData.postRead.assignments} />
                <MiniStat title="Submitted" value={sessionData.postRead.submissions} />
                <MiniStat title="Pending" value={sessionData.postRead.pending} />
            </Grid>

            {loading && <Skeleton variant="rounded" height={80} sx={{ mb: 1.5 }} />}

            {!loading && items.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No assignments created yet.</Typography>
            )}

            {items.map((item) => (
                <ResourceRow
                    key={item.id}
                    icon="tabler-clipboard-text"
                    title={item.title}
                    type={item.type}
                    progress=""
                    status={`${item.submissions} submissions`}
                />
            ))}

            <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() => goTo(`/${lang}/apps/batch-session/resource/post-read?batchId=${batchId}&sessionId=${sessionId}`)}
            >
                Open Post-read
            </Button>
        </Box>
    );
};

const NotesTab = ({ batchId, sessionId }) => {
    const { ready, apiGet, apiPut } = useApi();
    const [note, setNote] = useState({ topics_covered: [], outcome_notes: "", completed: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState("");

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await apiGet(`/user/trainer/batches/${batchId}/sessions/${sessionId}/notes`);
                if (!cancelled) setNote(data.note);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [ready]);

    const saveNotes = async () => {
        try {
            setSaving(true);
            await apiPut(`/user/trainer/batches/${batchId}/sessions/${sessionId}/notes`, {
                topics_covered: note.topics_covered,
                outcome_notes: note.outcome_notes,
            });
            setSnack("Notes saved");
        } finally {
            setSaving(false);
        }
    };

    const completeSession = async () => {
        try {
            setSaving(true);
            await apiPut(`/user/trainer/batches/${batchId}/sessions/${sessionId}/complete`, {});
            setSnack("Session marked as completed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Skeleton variant="rounded" height={300} />;

    return (
        <Box>
            <PageHeading title="Session Notes" subtitle="Record trainer observations and session outcomes" />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Topics Covered</Typography>
                    <Stack spacing={1}>
                        {(note.topics_covered.length ? note.topics_covered : ["No topics logged yet"]).map((item) => (
                            <Paper key={item} elevation={0} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, display: "flex", gap: 1, alignItems: "center" }}>
                                <i className="tabler-check" />
                                <Typography variant="body2">{item}</Typography>
                            </Paper>
                        ))}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Session Outcome</Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={7}
                        placeholder="Enter session notes, learner engagement, issues and follow-up..."
                        value={note.outcome_notes}
                        onChange={(e) => setNote((prev) => ({ ...prev, outcome_notes: e.target.value }))}
                    />
                </Grid>

                <Grid size={12}>
                    <Divider />
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                        <Button variant="outlined" startIcon={<i className="tabler-device-floppy" />} onClick={saveNotes} disabled={saving}>
                            Save Notes
                        </Button>
                        <Button variant="contained" color="success" startIcon={<i className="tabler-circle-check" />} onClick={completeSession} disabled={saving || note.completed}>
                            {note.completed ? "Session Completed" : "Complete Session"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
        </Box>
    );
};

const PageHeading = ({ title, subtitle }) => (
    <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
    </Box>
);

const MiniStat = ({ title, value }) => (
    <Grid size={{ xs: 6, md: 3 }}>
        <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{title}</Typography>
            <Typography variant="h6" fontWeight={700}>{value}</Typography>
        </Paper>
    </Grid>
);

const ResourceRow = ({ icon, title, type, progress, status }) => (
    <Paper elevation={0} sx={{ p: 2, mb: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ borderRadius: 2, bgcolor: "primary.lighter", color: "primary.main" }}>
                <i className={icon} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {type}{status ? ` • ${status}` : ""}
                </Typography>
                {progress && (
                    <LinearProgress variant="determinate" value={parseInt(progress)} sx={{ mt: 1, height: 6, borderRadius: 5 }} />
                )}
            </Box>
            <Button size="small" variant="outlined" sx={{ textTransform: "none" }}>Open</Button>
        </Box>
    </Paper>
);

export default SessionDetailsPage;
