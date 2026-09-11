"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

import { useRouter, useParams } from "next/navigation"

import { useSession } from "next-auth/react"

import {
    Box,
    Tab,
    Card,
    useMediaQuery,
    useTheme,
    Select,
    CircularProgress,
    CardContent,
    Typography,
    FormHelperText,
    Skeleton,
    Checkbox,
    Button,
    DialogActions,
    RadioGroup,
    Avatar,
    Chip,
    Radio,
    IconButton,
    Dialog,
    InputAdornment,
    DialogTitle,
    DialogContent,
    FormControlLabel,
    ListItemText,
    TextField,
    MenuItem,
    Stack,
    Paper,
    Switch,
    Divider,
    Tooltip,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { useDropzone } from 'react-dropzone'

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'

import { useForm, Controller } from 'react-hook-form'

import { TabContext, TabList, TabPanel } from "@mui/lab";

import { toast } from "react-toastify"

import ExcelJS from "exceljs";

import DialogCloseButton from "@/components/dialogs/DialogCloseButton";

import DefinedBatch from "./Batch/DefinedBatch";
import NominationBatch from "./Batch/NominationBatch";
import ImportUserModal from "./Batch/ImportUserModal";
import ImportBatchModal from "./Batch/ImportBatchModal";
import ConfigurePanel from "./TabPanelComponent/ConfigurePanel";
import InvitePanel from "./TabPanelComponent/InvitePanel";
import EngagePanel from "./TabPanelComponent/EngagePanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

const MAX_PAIRS = 5;

const labelOption = {
    "7": "Define your custom options",
    "8": "Define your Likert scale",
    "9": "Define your Satisfaction scale",
    "10": "Define your Quality scale"
}

const QUESTION_TYPES = [
    { label: 'Yes or No', value: '1' },
    { label: 'Rating (1–5)', value: '2' },
    { label: 'Rating (1–10)', value: '3' },
    { label: 'Rating (1–5) - Emoji', value: '4' },
    { label: 'Rating (1–5) - Star', value: '5' },
    { label: 'Subjective Answer', value: '6' },
    { label: 'Multiple Choice', value: '7' },
    { label: 'Likert Scale', value: '8' },
    { label: 'Satisfaction Scale', value: '9' },
    { label: 'Quality Scale', value: '10' },
]

const enrollmentOptions = [
    { value: "1", label: "Do not allow self enrollment" },
    { value: "2", label: "Allow any learner to self enroll" },
    { value: "3", label: "Allow learners who meet target audience criteria" },
];

const OPTION_BASED_TYPES = ['7', '8', '9', '10']

const fieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
};

const EVENT_OPTIONS = [
    'Attendance Status (Session Level): Saved - Present',
    'Attendance Status (Session Level): Saved - Absent',
    'Before Batch Starts',
    'Before Session Starts',
    'Survey Reminder'
]

const TAGS = ['First Name', 'Last Name', 'Program Name', 'Content Folder Name', 'Module Name', 'Module Type']

const NAV_ITEMS = [
    { key: 'settings', label: 'Settings', Icon: "tabler-settings" },
    { key: 'message', label: 'Message', Icon: "tabler-mail" },
    { key: 'recipients', label: 'Recipients', Icon: "tabler-users" }
]

const createEmptyQuestion = () => ({
    id: Date.now() + Math.random(),
    text: '',
    type: '',
    options: null,
    mandatory: false,
    errors: { text: false, type: false }
})

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


const normalizeOptions = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => String(v));

    return [String(val)];
};

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



// Small +/- numeric stepper used for "days before" / "repeats every" fields
const NumberStepper = ({ value, onChange, prefixLabel, suffixLabel }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            px: 2,
            py: 1,
            width: 'fit-content'
        }}
    >
        {prefixLabel && (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                {prefixLabel}
            </Typography>
        )}
        <IconButton
            size="small"
            onClick={() => onChange(Math.max(0, value - 1))}
            sx={{ bgcolor: 'action.hover', borderRadius: 1, width: 28, height: 28 }}
        >
            <i className="tabler-minus" fontSize="inherit" />
        </IconButton>
        <TextField
            size="small"
            value={value}
            onChange={e => {
                const num = parseInt(e.target.value, 10)
                onChange(Number.isNaN(num) || num < 0 ? 0 : num)
            }}
            inputProps={{ style: { textAlign: 'center', width: 32 } }}
        />
        <IconButton
            size="small"
            onClick={() => onChange(value + 1)}
            sx={{ bgcolor: 'action.hover', borderRadius: 1, width: 28, height: 28 }}
        >
            <i className="tabler-plus" fontSize="inherit" />
        </IconButton>
        {suffixLabel && (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                {suffixLabel}
            </Typography>
        )}
    </Box>
)

const FieldLabel = ({ children, required }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {children}
        {required && (
            <Box component="span" sx={{ color: 'error.main' }}>
                {' *'}
            </Box>
        )}
    </Typography>
)

const EngageColumn = ({ title, children, ctaLabel, slug, activityData, token, fetchActivities, mId }) => {

    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState()
    const [next, setNext] = useState(false)

    return (

        <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            {children}
            <Box mt={3}>
                <Button fullWidth variant="outlined" onClick={() => {

                    setIsOpen(true)
                }}>
                    {ctaLabel}
                </Button>
            </Box>
            <ActivityCreateModal
                open={isOpen}
                setOpen={setIsOpen}
                data={activityData}
                token={token}
                slug={slug}
                fetchActivities={fetchActivities}
                setSelected={setSelected}
                selected={selected}
                setNext={setNext}
                mId={mId}
            />
        </Grid>
    )
};

const ILTPageComponent = () => {

    const [value, setValue] = useState("configure");
    const handleTabChange = (e, newValue) => setValue(newValue);

    const { mId } = useParams();

    const { data: session } = useSession();
    const token = session?.user?.token;

    const [certificateData, setCertificateData] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [activityData, setActivityData] = useState()
    const [finalData, setFinalData] = useState()

    // Page-level loading flag — true until the first successful
    // handleFetchData resolves (or errors out), used to drive the
    // skeleton screens across all three tabs.
    const [pageLoading, setPageLoading] = useState(true);

    const [createData, setCreateData] = useState({
        designation: [],
        department: [],
        group: [],
        region: [],
        user: [],
    });

    const handleFetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/company/ILT/data/${mId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();

            if (response.ok) {

                const value = result?.data;

                setFinalData(value)

                const questionData = value?.moduleSurvey;

                setCertificateData(value?.certificate || []);
                setQuestions(
                    questionData?.length
                        ? questionData?.map((q) => ({
                            id: Date.now() + Math.random(),
                            text: q.question || "",
                            options: q.options || [],
                            multiOption: q.multiOption || false,
                            type: q.questionsType || "",
                            mandatory: q.mandatory || false,
                            errors: { text: false, type: false },
                        }))
                        : []
                );
                const create_data = {
                    designation: value?.designation || [],
                    department: value?.department || [],
                    group: value?.group || [],
                    region: value?.region || [],
                    user: value?.user || [],
                };

                setCreateData(create_data);
                setActivityData(value?.appConfig)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (API_URL && token) {

            handleFetchData();
        }
    }, [API_URL, token]);

    const canManageLearners = !finalData?.finalSchedule?.moduleSetting?.trainerAllowed || true; // see note above — wire real role check here

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
                            <ConfigurePanel
                                token={token}
                                handleFetchData={handleFetchData}
                                setQuestions={setQuestions}
                                questions={questions}
                                mId={mId}
                                createData={createData}
                                certificateData={certificateData}
                                loading={pageLoading}
                                finalData={finalData}
                                finalScheduleData={finalData?.finalSchedule}
                            />
                        </TabPanel>
                        <TabPanel value="invite" className="p-0">
                            <InvitePanel
                                loading={pageLoading}
                                mId={mId}
                                token={token}
                                fetchActivities={handleFetchData}
                                finalData={finalData}
                                activityData={activityData}
                                users={createData.user}
                                canManage={canManageLearners}
                            />
                        </TabPanel>
                        <TabPanel value="engage" className="p-0">
                            <EngagePanel
                                activityData={activityData}
                                token={token}
                                fetchActivities={handleFetchData}
                                loading={pageLoading}
                                mId={mId}
                                finalData={finalData}
                            />
                        </TabPanel>
                    </Box>
                </TabContext>
            </CardContent>
        </Card>
    );
};

export default ILTPageComponent;
