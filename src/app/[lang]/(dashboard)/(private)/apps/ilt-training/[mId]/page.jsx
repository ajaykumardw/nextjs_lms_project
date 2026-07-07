"use client";

import React, { useState } from "react";

import {
    Box,
    Tabs,
    Tab,
    Typography,
    Checkbox,
    Button,
    RadioGroup,
    Radio,
    Dialog,
    InputAdornment,
    DialogTitle,
    DialogContent,
    FormControlLabel,
    TextField,
    MenuItem,
    Stack,
    Paper,
    Switch,
    Divider,
    GlobalStyles,
    useTheme,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import Grid from "@mui/material/Grid2";

import {
    IconLock,
    IconCertificate,
    IconMessage2,
    IconUserPlus,
    IconChecklist,
    IconTag,
    IconBellRinging,
    IconAdjustments,
    IconCircleCheckFilled,
    IconFileText,
    IconPlus,
    IconAlertCircle,
    IconCube,
    IconInfoCircle,
    IconBrandYoutube,
    IconVideo,
    IconHelpSquareRounded,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton"

const ACCENTS = {
    neutral: "#8A94A6",
    amber: "#F59E0B",
    teal: "#14B8A6",
    indigo: "#6366F1",
    rose: "#F43F5E",
    purple: "#A855F7",
    green: "#22C55E",
};

const EngageCard = ({ icon, title, subtitle, runtime, rightInfo }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                height: 145,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Box>
                <Box sx={{ color: "text.secondary", mb: 1 }}>{icon}</Box>
                <Divider sx={{ mb: 1 }} />
                <Typography
                    sx={{
                        fontWeight: 600,
                        color: "primary.main",
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                <Stack direction="row" spacing={1}>
                    <IconEdit
                        size={18}
                        color={theme.palette.primary.main}
                        style={{ cursor: "pointer" }}
                    />
                    <IconTrash
                        size={18}
                        color={theme.palette.primary.main}
                        style={{ cursor: "pointer" }}
                    />
                </Stack>

                {runtime && (
                    <Typography variant="body2" color="text.secondary">
                        {runtime}
                    </Typography>
                )}

                {rightInfo && <Box textAlign="right">{rightInfo}</Box>}
            </Box>
        </Paper>
    );
};

const SectionHeader = ({ icon, title }) => {
    const theme = useTheme();

    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
            >
                {icon}
                <Typography
                    variant="h6"
                    sx={{
                        color: "primary.main",
                        fontWeight: 500,
                    }}
                >
                    {title}
                </Typography>
                <IconInfoCircle size={16} color={theme.palette.text.secondary} />
            </Stack>
            <Divider />
        </Box>
    );
};

const EngagePanel = () => {
    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Pre Reads */}
            <Grid size={{ xs: 12, md: 4 }}>
                <SectionHeader title="Pre-reads" icon={<IconCube size={24} />} />
                <Box mt={2}>
                    <EngageCard
                        icon={<IconBrandYoutube size={30} />}
                        title="YouTube Videos"
                        runtime="02:09 Runtime"
                    />
                </Box>
                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" sx={{ borderRadius: 20, textTransform: "none", px: 4 }}>
                        Pre-Read
                    </Button>
                </Box>
            </Grid>

            {/* Training Material */}
            <Grid size={{ xs: 12, md: 4 }}>
                <SectionHeader title="Training Material" icon={<IconCube size={24} />} />
                <Box mt={2}>
                    <EngageCard
                        icon={<IconVideo size={30} />}
                        title="Videos"
                        runtime="04:26 Runtime"
                    />
                </Box>
                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" sx={{ borderRadius: 20, textTransform: "none", px: 4 }}>
                        Training Material
                    </Button>
                </Box>
            </Grid>

            {/* Post Reads */}
            <Grid size={{ xs: 12, md: 4 }}>
                <SectionHeader title="Post-reads" icon={<IconCube size={24} />} />
                <Box mt={2}>
                    <EngageCard
                        icon={<IconHelpSquareRounded size={30} />}
                        title="Objective-Type Quizzes"
                        subtitle="Available in 3 languages"
                        rightInfo={
                            <>
                                <Typography variant="body2" color="text.secondary">2 Questions</Typography>
                                <Typography variant="body2" color="text.secondary">2 Minutes</Typography>
                            </>
                        }
                    />
                </Box>
                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" sx={{ borderRadius: 20, textTransform: "none", px: 4 }}>
                        Post-Read
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}

const SectionCard = ({ accent, icon, title, description, children }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 4 },
                mb: 3,
                borderRadius: "20px",
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                transition: "box-shadow .2s ease",
                "&:hover": {
                    boxShadow:
                        theme.palette.mode === "dark"
                            ? "0 8px 24px rgba(0,0,0,0.35)"
                            : "0 8px 24px rgba(16, 24, 40, 0.06)",
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="flex-start" mb={description ? 1 : 2.5}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(accent, theme.palette.mode === "dark" ? 0.22 : 0.12),
                        color: accent,
                    }}
                >
                    {icon}
                </Box>

                <Box>
                    <Typography
                        sx={{
                            fontFamily: "'Sora', sans-serif",
                            fontWeight: 600,
                            fontSize: "1.05rem",
                            color: theme.palette.text.primary,
                        }}
                    >
                        {title}
                    </Typography>

                    {description && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                            {description}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Box sx={{ pl: { xs: 0, md: "60px" } }}>{children}</Box>
        </Paper>
    );
};

const DefinedBatch = ({ setOpenBatchModal }) => {
    return (
        <Box sx={{ p: 4 }}>
            {/* Header Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={0}>
                    <Tab label="Create" />
                    <Tab label="Settings" disabled />
                </Tabs>
            </Box>

            {/* Batch Detail Form */}
            <Typography variant="h6" gutterBottom>Batch Detail</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <TextField fullWidth label="Batch Name *" placeholder="Batch Name" size="small" />
                </Grid>
                <Grid item xs={12} md={4} display="flex" alignItems="flex-end">
                    <Button variant="outlined" fullWidth sx={{ height: '40px' }}>Add Attachment</Button>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="From (Start Date) *" type="date" InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="To (End Date) *" type="date" InputLabelProps={{ shrink: true }} size="small" />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Venue (Place Or Conference Link)" placeholder="(Optional)" size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Cost Per Learner" defaultValue="0" type="number" size="small" />
                </Grid>
            </Grid>

            {/* Participant Status Tabs */}
            <Box sx={{ mb: 2 }}>
                <Tabs value={0} textColor="primary" indicatorColor="primary">
                    <Tab label="Confirmed" />
                    <Tab label="Not responded" />
                    <Tab label="Declined" />
                    <Tab label="Instructors" />
                </Tabs>
                <Divider />
            </Box>

            {/* Content Area */}
            <Box sx={{ py: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                    No confirmed Participants yet
                </Typography>
                <Button variant="contained" size="small">Add Learners</Button>
            </Box>

            {/* Modal Footer Area */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, pb: 2 }}>
                <Button variant="outlined" onClick={() => setOpenBatchModal(false)}>Close</Button>
                <Button variant="contained" disabled>Publish</Button>
                <Button variant="contained">Save</Button>
            </Box>
        </Box>
    );
};

const NominationBatch = ({ setOpenBatchModal }) => {
    const [tabValue, setTabValue] = useState(0);

    return (
        <Box>
            {/* Batch Detail Section */}
            <Typography variant="h6" sx={{ mb: 2 }}>Batch Detail</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                <TextField
                    label="Batch Name"
                    placeholder="Nominations Batch"
                    required
                    fullWidth
                />
                <Button variant="contained" sx={{ mt: 1, textTransform: 'none', whiteSpace: 'nowrap' }}>
                    Add Attachment
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField label="Nominations Capacity" type="number" defaultValue={0} sx={{ width: '200px' }} />
                <TextField label="Close Registrations By" type="date" InputLabelProps={{ shrink: true }} sx={{ width: '250px' }} />
            </Box>

            {/* Tabs Section */}
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label="Nominated" />
                <Tab label="Not responded" />
                <Tab label="Declined" />
            </Tabs>

            {/* Search Section */}
            <TextField
                placeholder="Search User"
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button>Advanced Search</Button>
                        </InputAdornment>
                    )
                }}
            />

            {/* Footer Actions */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, pb: 2 }}>
                <Button variant="outlined" onClick={() => setOpenBatchModal(false)}>Close</Button>
                <Button variant="contained" disabled>Publish</Button>
                <Button variant="contained">Save</Button>
            </Box>
        </Box>
    );
};

const BatchModal = ({ openBatchModal, setOpenBatchModal, batchType }) => {
    return (
        <>
            <Dialog
                open={openBatchModal}
                onClose={() => setOpenBatchModal(false)}
                fullWidth

                maxWidth="md"
                sx={{
                    '& .MuiDialog-paper': {
                        overflow: 'visible',
                        blockSize: 'auto', // Allows height to adjust to content

                    }
                }}
            >
                <DialogCloseButton onClick={() => setOpenBatchModal(false)}><i className="tabler-x" /></DialogCloseButton>
                <DialogTitle variant='h4' className='text-center'>Batch Create</DialogTitle>

                <DialogContent >
                    {/* Replace this Box with your complete Batch Create UI */}
                    <Box
                        sx={{
                            bgcolor: "background.paper",
                        }}
                    >
                        {batchType == "defined" && (
                            <DefinedBatch setOpenBatchModal={setOpenBatchModal} />
                        )}

                        {batchType == "nominations" && (
                            <NominationBatch setOpenBatchModal={setOpenBatchModal} />
                        )}

                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}

const InvitePanel = () => {
    const theme = useTheme();
    const [batchType, setBatchType] = useState("nominations");
    const [openBatchModal, setOpenBatchModal] = useState(false);

    const batchOptions = [
        {
            value: "defined",
            title: "Batch with defined details",
            description: "Batches that have defined date, venue and trainer details.",
        },
        {
            value: "nominations",
            title: "Nominations Batch",
            description:
                "A Batch that has very few details, primarily used to gauge interest of the users.",
        },
        {
            value: "import",
            title: "Import Batches and Sessions",
            description: "Import Batches that have defined date, venue and trainer details. Download the template from",
            link: "here",
        },
    ];

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    p: { xs: 2, md: 2.5 },
                    mb: 3,
                    borderRadius: "14px",
                    border: `1px solid ${alpha(ACCENTS.amber, theme.palette.mode === "dark" ? 0.4 : 0.3)}`,
                    bgcolor: alpha(ACCENTS.amber, theme.palette.mode === "dark" ? 0.14 : 0.08),
                }}
            >
                <IconAlertCircle
                    size={20}
                    stroke={1.75}
                    style={{ color: ACCENTS.amber, flexShrink: 0, marginTop: 2 }}
                />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                    You have no Batches yet, please select any of the options below to create your first
                    Batch. You can add more Batches once you create the first.
                </Typography>
            </Paper>

            <RadioGroup
                name="batch-type"
                value={batchType}
                onChange={(e) => setBatchType(e.target.value)}
            >
                <Stack spacing={0.5} mb={4}>
                    {batchOptions.map((option) => {
                        
                        const selected = batchType === option.value;

                        return (
                            <Box
                                key={option.value}
                                onClick={() => setBatchType(option.value)}
                                sx={{
                                    display: "flex",
                                    gap: 1.5,
                                    alignItems: "flex-start",
                                    p: 1.5,
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    bgcolor: selected
                                        ? alpha(ACCENTS.indigo, theme.palette.mode === "dark" ? 0.16 : 0.06)
                                        : "transparent",
                                    transition: "background-color .15s ease",
                                }}
                            >
                                <Radio checked={selected} value={option.value} size="small" sx={{ mt: -0.25 }} />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ color: theme.palette.text.primary }}
                                    >
                                        {option.title}
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        {option.description}
                                        {option.link && (
                                            <>
                                                {" "}
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        textDecoration: "underline",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {option.link}
                                                </Box>
                                                .
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            </RadioGroup>

            <Divider sx={{ mb: 3 }} />

            <Stack direction="row" justifyContent="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        if (batchType != "import") {

                            setOpenBatchModal(true);
                        }
                    }}
                    sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 4,
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                    }}
                >
                    Create
                </Button>
            </Stack>
            <BatchModal
                batchType={batchType}
                openBatchModal={openBatchModal}
                setOpenBatchModal={setOpenBatchModal}
            />
        </Box>
    );
};

const ILTPageComponent = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [enrollment, setEnrollment] = useState("allow");
    const [selectedCertificate, setSelectedCertificate] = useState(1);

    const tabs = ["Configure", "Invite", "Engage"];

    const enrollmentOptions = [
        { value: "none", label: "Do not allow self enrollment" },
        { value: "allow", label: "Allow any learner to self enroll" },
        { value: "criteria", label: "Allow learners who meet target audience criteria" },
    ];

    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                fontFamily: "'Inter', sans-serif",
                color: theme.palette.text.primary,
            }}
        >
            {/* Font import only — no color set here, so this stays mode-agnostic */}
            <GlobalStyles
                styles={`
                    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600&display=swap');
                `}
            />

            <Box sx={{ mx: "auto" }}>
                {/* Tabs */}

                <Paper
                    elevation={0}
                    sx={{
                        mb: 3,
                        p: 0.75,
                        borderRadius: "16px",
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        display: "inline-flex",
                        width: "100%",
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(e, value) => setTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        TabIndicatorProps={{ sx: { display: "none" } }}
                        sx={{
                            minHeight: 0,
                            width: "100%",
                            "& .MuiTabs-flexContainer": { gap: 0.5 },
                        }}
                    >
                        {tabs.map((label) => (
                            <Tab
                                key={label}
                                label={label}
                                disableRipple
                                sx={{
                                    fontFamily: "'Sora', sans-serif",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    minHeight: 40,
                                    borderRadius: "12px",
                                    color: theme.palette.text.secondary,
                                    "&.Mui-selected": {
                                        color: theme.palette.primary.contrastText,
                                        bgcolor: theme.palette.primary.main,
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </Paper>

                {tab === 0 && (
                    <>
                        {/* Top */}

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            spacing={2}
                            mb={3}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontFamily: "'Sora', sans-serif",
                                        fontWeight: 700,
                                        fontSize: "1.5rem",
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    Configure
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                                    Set how this module launches, who can join it, and what happens.
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<IconAdjustments size={18} stroke={2} />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "12px",
                                    px: 2.5,
                                    py: 1,
                                    boxShadow: "none",
                                    "&:hover": { boxShadow: "none" },
                                }}
                            >
                                Advanced Settings
                            </Button>
                        </Stack>

                        {/* Permission */}

                        <SectionCard
                            accent={ACCENTS.neutral}
                            icon={<IconLock size={20} stroke={1.75} />}
                            title="Edit Permissions"
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Checkbox sx={{ p: 0 }} />
                                <Typography variant="body2">
                                    Disallow other Trainers to make changes to this Module
                                </Typography>
                            </Stack>
                        </SectionCard>

                        {/* Completion */}

                        <SectionCard
                            accent={ACCENTS.amber}
                            icon={<IconCertificate size={20} stroke={1.75} />}
                            title="On Completion Of Module Launch The Following"
                            description="Choose what learners receive the moment they finish."
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
                                <Checkbox defaultChecked sx={{ p: 0 }} />

                                <Typography variant="body2" fontWeight={600}>
                                    Certificate
                                </Typography>

                                <Button
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        borderColor: theme.palette.divider,
                                        color: theme.palette.text.primary,
                                        "&:hover": {
                                            borderColor: ACCENTS.amber,
                                            bgcolor: alpha(ACCENTS.amber, theme.palette.mode === "dark" ? 0.16 : 0.08),
                                        },
                                    }}
                                >
                                    Quick Preview
                                </Button>
                            </Stack>

                            <Grid container spacing={2}>
                                {[1, 2, 3].map((item) => {
                                    const selected = selectedCertificate === item;
                                    
                                    return (
                                        <Grid size={{ xs: 12, sm: 4, md: 3 }} key={item}>
                                            <Paper
                                                onClick={() => setSelectedCertificate(item)}
                                                elevation={0}
                                                sx={{
                                                    p: 1.25,
                                                    textAlign: "center",
                                                    cursor: "pointer",
                                                    borderRadius: "14px",
                                                    border: selected
                                                        ? `2px solid ${ACCENTS.amber}`
                                                        : `1px solid ${theme.palette.divider}`,
                                                    position: "relative",
                                                    transition: "transform .15s ease, box-shadow .15s ease",
                                                    "&:hover": {
                                                        transform: "translateY(-2px)",
                                                        boxShadow: `0 8px 20px ${alpha(ACCENTS.amber, 0.18)}`,
                                                    },
                                                }}
                                            >
                                                {selected && (
                                                    <IconCircleCheckFilled
                                                        size={20}
                                                        style={{
                                                            position: "absolute",
                                                            top: 6,
                                                            right: 6,
                                                            color: ACCENTS.amber,
                                                            background: theme.palette.background.paper,
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                )}

                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: 100,
                                                        mb: 1,
                                                        borderRadius: "10px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        bgcolor: alpha(ACCENTS.amber, theme.palette.mode === "dark" ? 0.16 : 0.1),
                                                        color: ACCENTS.amber,
                                                    }}
                                                >
                                                    <IconFileText size={28} stroke={1.5} />
                                                </Box>

                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                    Certificate {item}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </SectionCard>

                        {/* Feedback */}

                        <SectionCard
                            accent={ACCENTS.teal}
                            icon={<IconMessage2 size={20} stroke={1.75} />}
                            title="Feedback Survey"
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Checkbox sx={{ p: 0 }} />
                                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                    Collect a short survey from learners after they complete this module
                                </Typography>

                                <Button
                                    variant="outlined"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        borderColor: theme.palette.divider,
                                        color: theme.palette.text.primary,
                                        "&:hover": {
                                            borderColor: ACCENTS.teal,
                                            bgcolor: alpha(ACCENTS.teal, theme.palette.mode === "dark" ? 0.16 : 0.08),
                                        },
                                    }}
                                >
                                    Add A Survey
                                </Button>
                            </Stack>
                        </SectionCard>

                        {/* Self Enrollment */}

                        <SectionCard
                            accent={ACCENTS.indigo}
                            icon={<IconUserPlus size={20} stroke={1.75} />}
                            title="Self Enrollment Settings"
                        >
                            <RadioGroup
                                name="self-enrollment"
                                value={enrollment}
                                onChange={(e) => setEnrollment(e.target.value)}
                            >
                                <Stack spacing={1.25}>
                                    {enrollmentOptions.map((option) => {
                                        const selected = enrollment === option.value;
                                        
                                        return (
                                            <Paper
                                                key={option.value}
                                                elevation={0}
                                                onClick={() => setEnrollment(option.value)}
                                                sx={{
                                                    px: 2,
                                                    py: 1.25,
                                                    borderRadius: "12px",
                                                    cursor: "pointer",
                                                    border: selected
                                                        ? `1.5px solid ${ACCENTS.indigo}`
                                                        : `1px solid ${theme.palette.divider}`,
                                                    bgcolor: selected
                                                        ? alpha(ACCENTS.indigo, theme.palette.mode === "dark" ? 0.18 : 0.08)
                                                        : "transparent",
                                                    transition: "all .15s ease",
                                                }}
                                            >
                                                <FormControlLabel
                                                    value={option.value}
                                                    control={<Radio size="small" name="self-enrollment" />}
                                                    label={<Typography variant="body2">{option.label}</Typography>}
                                                    sx={{ m: 0, width: "100%" }}
                                                />
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </RadioGroup>
                        </SectionCard>

                        {/* Approval */}

                        <SectionCard
                            accent={ACCENTS.rose}
                            icon={<IconChecklist size={20} stroke={1.75} />}
                            title="Approval Criteria"
                        >
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Approval Workflow"
                                        defaultValue=""
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    >
                                        <MenuItem value="">Select...</MenuItem>
                                        <MenuItem value="1">Workflow 1</MenuItem>
                                        <MenuItem value="2">Workflow 2</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Module Cost"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>
                            </Grid>
                        </SectionCard>

                        {/* Tags */}

                        <SectionCard
                            accent={ACCENTS.purple}
                            icon={<IconTag size={20} stroke={1.75} />}
                            title="Tags & Search Keywords"
                        >
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Target Competency Level"
                                        defaultValue="all"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    >
                                        <MenuItem value="all">All</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Select competency level
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Primary Tag"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        These tags help in filtering modules.
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Secondary Tag"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        These tags create collections.
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Search Keywords"
                                        placeholder="Enter keywords..."
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Keywords help improve search.
                                    </Typography>
                                </Grid>
                            </Grid>
                        </SectionCard>

                        {/* Communication */}

                        <SectionCard
                            accent={ACCENTS.green}
                            icon={<IconBellRinging size={20} stroke={1.75} />}
                            title="Communication Settings"
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Switch
                                    defaultChecked
                                    sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENTS.green },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                            bgcolor: ACCENTS.green,
                                        },
                                    }}
                                />

                                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                    Enable Completion Reminder Emails
                                </Typography>

                                <Button
                                    variant="contained"
                                    startIcon={<IconPlus size={18} stroke={2} />}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        bgcolor: ACCENTS.green,
                                        boxShadow: "none",
                                        "&:hover": { bgcolor: "#16A34A", boxShadow: "none" },
                                    }}
                                >
                                    Add
                                </Button>
                            </Stack>
                        </SectionCard>
                    </>
                )}

                {tab === 1 && <InvitePanel />}

                {tab == 2 && <EngagePanel />}
            </Box>
        </Box>
    );
};

export default ILTPageComponent;
