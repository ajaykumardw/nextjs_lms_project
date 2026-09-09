"use client";

import React, { useState, useRef } from "react";

import {
    Box,
    Tab,
    Card,
    CardContent,
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
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { TabContext, TabList, TabPanel } from "@mui/lab";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";

/* -------------------------------------------------------------------- */
/*  Shared bits                                                          */
/* -------------------------------------------------------------------- */

const fieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
};

const SectionBlock = ({ title, description, children }) => (
    <Box mb={5}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
        </Typography>
        {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
            </Typography>
        )}
        <Box>{children}</Box>
    </Box>
);

const EngageCard = ({ title, subtitle, runtime, rightInfo }) => (
    <Card variant="outlined" sx={{ height: 140 }}>
        <CardContent
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Box>
                <Typography fontWeight={600} variant="body1" gutterBottom>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Box display="flex" justifyContent="flex-end">
                {runtime && (
                    <Typography variant="body2" color="text.secondary">
                        {runtime}
                    </Typography>
                )}
                {rightInfo && <Box textAlign="right">{rightInfo}</Box>}
            </Box>
        </CardContent>
    </Card>
);

const EngageColumn = ({ title, children, ctaLabel }) => (
    <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
        </Typography>
        {children}
        <Box mt={3}>
            <Button fullWidth variant="outlined">
                {ctaLabel}
            </Button>
        </Box>
    </Grid>
);

const EngagePanel = () => (
    <Grid container spacing={4}>
        <EngageColumn title="Pre-reads" ctaLabel="Add a pre-read">
            <EngageCard title="YouTube Videos" runtime="02:09 runtime" />
        </EngageColumn>

        <EngageColumn title="Training material" ctaLabel="Add training material">
            <EngageCard title="Videos" runtime="04:26 runtime" />
        </EngageColumn>

        <EngageColumn title="Post-reads" ctaLabel="Add a quiz">
            <EngageCard
                title="Objective-type quiz"
                subtitle="Available in 3 languages"
                rightInfo={
                    <>
                        <Typography variant="body2" color="text.secondary">2 questions</Typography>
                        <Typography variant="body2" color="text.secondary">2 minutes</Typography>
                    </>
                }
            />
        </EngageColumn>
    </Grid>
);

/* -------------------------------------------------------------------- */
/*  Certificate picker                                                   */
/* -------------------------------------------------------------------- */

const CertificatePicker = ({ selected, onSelect }) => (
    <Box display="flex" gap={2} flexWrap="wrap">
        {[1, 2, 3].map((item) => {
            const isSelected = selected === item;

            return (
                <Card
                    key={item}
                    onClick={() => onSelect(item)}
                    sx={{
                        width: 180,
                        height: 120,
                        borderRadius: 2,
                        border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0",
                        cursor: "pointer",
                        position: "relative",
                    }}
                >
                    {isSelected && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                backgroundColor: "primary.main",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                            }}
                        >
                            <i className="tabler-check" />
                        </Box>
                    )}
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                            Certificate {item}
                        </Typography>
                    </Box>
                </Card>
            );
        })}
    </Box>
);

/* -------------------------------------------------------------------- */
/*  Batch creation modal                                                 */
/* -------------------------------------------------------------------- */

const ModalFooter = ({ onClose }) => (
    <Box mt={3} display="flex" justifyContent="center" gap={2}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined" disabled>Publish</Button>
        <Button variant="contained">Save</Button>
    </Box>
);

const DefinedBatch = ({ setOpenBatchModal }) => {
    const [participantTab, setParticipantTab] = useState("confirmed");

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Batch detail
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField fullWidth label="Batch name *" placeholder="e.g. October cohort" size="small" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} display="flex" alignItems="stretch">
                    <Button variant="outlined" fullWidth>
                        Add attachment
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="From (start date) *" type="date" InputLabelProps={{ shrink: true }} size="small" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="To (end date) *" type="date" InputLabelProps={{ shrink: true }} size="small" sx={fieldSx} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Venue (place or conference link)" placeholder="Optional" size="small" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Cost per learner" defaultValue="0" type="number" size="small" sx={fieldSx} />
                </Grid>
            </Grid>

            <TabContext value={participantTab}>
                <TabList onChange={(e, v) => setParticipantTab(v)} className="border-b px-0 pt-0">
                    <Tab label="Confirmed" value="confirmed" />
                    <Tab label="Not responded" value="pending" />
                    <Tab label="Declined" value="declined" />
                    <Tab label="Instructors" value="instructors" />
                </TabList>

                <TabPanel value={participantTab} className="p-0">
                    <Box sx={{ py: 4, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
                            No confirmed participants yet
                        </Typography>
                        <Button variant="contained" size="small">
                            Add learners
                        </Button>
                    </Box>
                </TabPanel>
            </TabContext>

            <ModalFooter onClose={() => setOpenBatchModal(false)} />
        </Box>
    );
};

const NominationBatch = ({ setOpenBatchModal }) => {
    const [tabValue, setTabValue] = useState("nominated");

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Batch detail
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                <TextField label="Batch name" placeholder="Nominations batch" required fullWidth size="small" sx={fieldSx} />
                <Button variant="outlined" sx={{ whiteSpace: "nowrap" }}>
                    Add attachment
                </Button>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
                <TextField label="Nominations capacity" type="number" defaultValue={0} size="small" sx={{ width: { sm: 220 }, ...fieldSx }} />
                <TextField
                    label="Close registrations by"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ width: { sm: 260 }, ...fieldSx }}
                />
            </Stack>

            <TabContext value={tabValue}>
                <TabList onChange={(e, v) => setTabValue(v)} className="border-b px-0 pt-0">
                    <Tab label="Nominated" value="nominated" />
                    <Tab label="Not responded" value="pending" />
                    <Tab label="Declined" value="declined" />
                </TabList>

                <TabPanel value={tabValue} className="p-0">
                    <TextField
                        placeholder="Search by name or email"
                        fullWidth
                        size="small"
                        sx={{ my: 3, ...fieldSx }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button>Advanced search</Button>
                                </InputAdornment>
                            ),
                        }}
                    />
                </TabPanel>
            </TabContext>

            <ModalFooter onClose={() => setOpenBatchModal(false)} />
        </Box>
    );
};

const BatchModal = ({ openBatchModal, setOpenBatchModal, batchType }) => {
    const titleMap = {
        defined: "Create a defined batch",
        nominations: "Create a nominations batch",
    };

    return (
        <Dialog
            open={openBatchModal}
            onClose={() => setOpenBatchModal(false)}
            fullWidth
            maxWidth="md"
            sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}
        >
            <DialogCloseButton onClick={() => setOpenBatchModal(false)}>
                <i className="tabler-x" />
            </DialogCloseButton>
            <DialogTitle className="text-center">
                {titleMap[batchType] ?? "Create a batch"}
            </DialogTitle>

            <DialogContent>
                {batchType === "defined" && <DefinedBatch setOpenBatchModal={setOpenBatchModal} />}
                {batchType === "nominations" && <NominationBatch setOpenBatchModal={setOpenBatchModal} />}
            </DialogContent>
        </Dialog>
    );
};

/* -------------------------------------------------------------------- */
/*  Invite tab                                                           */
/* -------------------------------------------------------------------- */

const InvitePanel = () => {

    const [batchType, setBatchType] = useState("nominations");
    const [openBatchModal, setOpenBatchModal] = useState(false);

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        console.log("Selected file:", file);

        event.target.value = "";
    };

    const batchOptions = [
        {
            value: "defined",
            title: "Batch with defined details",
            description: "Has a fixed date, venue and trainer assigned before learners are invited.",
        },
        {
            value: "nominations",
            title: "Nominations batch",
            description: "Lightweight — used mainly to gauge interest before details are finalised.",
        },
        {
            value: "import",
            title: "Import batches and sessions",
            description: "Bring in batches that already have dates, venues and trainers assigned.",
            link: "Download the template",
        },
    ];

    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{ p: 2, mb: 4, borderColor: "warning.main", bgcolor: "warning.lighter" }}
            >
                <Typography variant="body2">
                    There are no batches yet. Choose one of the options below to create the first — you can add
                    more once it exists.
                </Typography>
            </Paper>

            <RadioGroup name="batch-type" value={batchType} onChange={(e) => setBatchType(e.target.value)}>
                <Stack spacing={1} mb={4}>
                    {batchOptions.map((option) => (
                        <Paper
                            key={option.value}
                            variant="outlined"
                            onClick={() => setBatchType(option.value)}
                            sx={{
                                display: "flex",
                                gap: 1.5,
                                alignItems: "flex-start",
                                p: 2,
                                cursor: "pointer",
                                borderColor: batchType === option.value ? "primary.main" : "divider",
                            }}
                        >
                            <Radio checked={batchType === option.value} value={option.value} size="small" sx={{ mt: -0.25 }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {option.title}
                                </Typography>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {option.description}
                                    {option.link && (
                                        <>
                                            {" — "}
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    const link = document.createElement("a");
                                                    link.href = "/sample/sample_batch_import.xlsx";
                                                    link.download = "sample_batch_import.xlsx";
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                {option.link}
                                            </Button>
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            </RadioGroup>

            <Divider sx={{ mb: 3 }} />

            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    onClick={() => {
                        if (batchType === "import") {
                            handleImportClick();
                        } else {
                            setOpenBatchModal(true);
                        }
                    }}
                >
                    {batchType === "import" ? "Import XLSX" : "Create batch"}
                </Button>
            </Box>

            <BatchModal batchType={batchType} openBatchModal={openBatchModal} setOpenBatchModal={setOpenBatchModal} />
        </Box>
    );
};

/* -------------------------------------------------------------------- */
/*  Configure tab                                                        */
/* -------------------------------------------------------------------- */

const ConfigurePanel = () => {
    const [enrollment, setEnrollment] = useState("allow");
    const [selectedCertificate, setSelectedCertificate] = useState(1);

    const enrollmentOptions = [
        { value: "none", label: "Do not allow self enrollment" },
        { value: "allow", label: "Allow any learner to self enroll" },
        { value: "criteria", label: "Allow learners who meet target audience criteria" },
    ];

    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12, md: 9 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            Configure
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Set how this module launches, who can join it, and what happens when it's done.
                        </Typography>
                    </Box>
                    <Button variant="outlined">Advanced settings</Button>
                </Box>

                <SectionBlock title="Edit permissions" description="Control who else can change this module's setup.">
                    <FormControlLabel
                        control={<Checkbox size="small" />}
                        label={<Typography variant="body2">Disallow other trainers from making changes to this module</Typography>}
                    />
                </SectionBlock>

                <SectionBlock
                    title="On completion, module launches the following"
                    description="Choose what learners receive the moment they finish."
                >
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <FormControlLabel
                            control={<Checkbox defaultChecked size="small" />}
                            label={<Typography variant="body2" fontWeight={600}>Certificate</Typography>}
                        />
                        <Button size="small" variant="outlined">
                            Quick preview
                        </Button>
                    </Box>
                    <CertificatePicker selected={selectedCertificate} onSelect={setSelectedCertificate} />
                </SectionBlock>

                <SectionBlock title="Feedback survey">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Checkbox size="small" />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            Collect a short survey from learners after they complete this module
                        </Typography>
                        <Button size="small" variant="outlined">
                            Add a survey
                        </Button>
                    </Box>
                </SectionBlock>

                <SectionBlock title="Self enrollment settings">
                    <RadioGroup name="self-enrollment" value={enrollment} onChange={(e) => setEnrollment(e.target.value)}>
                        <Stack spacing={1}>
                            {enrollmentOptions.map((option) => (
                                <Paper
                                    key={option.value}
                                    variant="outlined"
                                    onClick={() => setEnrollment(option.value)}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        cursor: "pointer",
                                        borderColor: enrollment === option.value ? "primary.main" : "divider",
                                    }}
                                >
                                    <FormControlLabel
                                        value={option.value}
                                        control={<Radio size="small" />}
                                        label={<Typography variant="body2">{option.label}</Typography>}
                                        sx={{ width: "100%" }}
                                    />
                                </Paper>
                            ))}
                        </Stack>
                    </RadioGroup>
                </SectionBlock>

                <SectionBlock title="Approval criteria">
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="approval-workflow-select"
                                fullWidth
                                select
                                label="Approval workflow"
                                defaultValue=""
                                size="small"
                                sx={fieldSx}
                                SelectProps={{
                                    labelId: "approval-workflow-select-label",
                                }}
                                InputLabelProps={{ id: "approval-workflow-select-label" }}
                            >
                                <MenuItem value="">Select...</MenuItem>
                                <MenuItem value="1">Workflow 1</MenuItem>
                                <MenuItem value="2">Workflow 2</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField id="module-cost-input" fullWidth label="Module cost" size="small" sx={fieldSx} />
                        </Grid>
                    </Grid>
                </SectionBlock>

                <SectionBlock title="Tags & search keywords">
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="target-competency-select"
                                fullWidth
                                select
                                label="Target competency level"
                                defaultValue="all"
                                size="small"
                                sx={fieldSx}
                                SelectProps={{
                                    labelId: "target-competency-select-label",
                                }}
                                InputLabelProps={{ id: "target-competency-select-label" }}
                            >
                                <MenuItem value="all">All</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                                Learners below this level won't see the module in search.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField id="primary-tag-input" fullWidth label="Primary tag" size="small" sx={fieldSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                                Used to filter the module into the right catalogue sections.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField id="secondary-tag-input" fullWidth label="Secondary tag" size="small" sx={fieldSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                                Groups this module together with related collections.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                id="search-keywords-input"
                                fullWidth
                                label="Search keywords"
                                placeholder="Comma separated"
                                size="small"
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                                Improves how easily learners find this module by search.
                            </Typography>
                        </Grid>
                    </Grid>
                </SectionBlock>

                <SectionBlock title="Communication settings">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Switch defaultChecked />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            Send a reminder email to learners who haven't finished the module
                        </Typography>
                        <Button size="small" variant="outlined">
                            Add reminder
                        </Button>
                    </Box>
                </SectionBlock>

                <Button variant="contained" sx={{ mt: 2 }}>
                    Save
                </Button>
            </Grid>
        </Grid>
    );
};

/* -------------------------------------------------------------------- */
/*  Main component                                                       */
/* -------------------------------------------------------------------- */

const ILTPageComponent = () => {
    const [value, setValue] = useState("configure");
    const handleTabChange = (e, newValue) => setValue(newValue);

    return (
        <Card>
            <CardContent>
                <TabContext value={value}>
                    <TabList
                        variant="scrollable"
                        onChange={handleTabChange}
                        className="border-b px-0 pt-0"
                    >
                        <Tab key={1} label="Configure" value="configure" />
                        <Tab key={2} label="Invite" value="invite" />
                        <Tab key={3} label="Engage" value="engage" />
                    </TabList>

                    <Box mt={3}>
                        <TabPanel value="configure" className="p-0">
                            <ConfigurePanel />
                        </TabPanel>
                        <TabPanel value="invite" className="p-0">
                            <InvitePanel />
                        </TabPanel>
                        <TabPanel value="engage" className="p-0">
                            <EngagePanel />
                        </TabPanel>
                    </Box>
                </TabContext>
            </CardContent>
        </Card>
    );
};

export default ILTPageComponent;
