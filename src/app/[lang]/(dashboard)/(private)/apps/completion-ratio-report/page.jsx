"use client"

import { useEffect, useState } from "react"

import { useSession } from "next-auth/react"

import {
    Box,
    Button,
    Tab,
    Tooltip,
    TextField,
    Typography,
    Select,
    MenuItem,
    Table,
    Skeleton,
    TableBody,
    TableCell,
    CircularProgress,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material"

import Grid from "@mui/material/Grid2"

import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { TabContext, TabList, TabPanel } from "@mui/lab"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const TableSkeletonRow = () => (
    <TableRow>
        <TableCell>
            <Skeleton width="60%" />
        </TableCell>
        <TableCell>
            <Skeleton variant="rectangular" height={20} />
        </TableCell>
        <TableCell>
            <Skeleton width="40%" />
        </TableCell>
        <TableCell>
            <Skeleton width="40%" />
        </TableCell>
        <TableCell>
            <Skeleton width="40%" />
        </TableCell>
    </TableRow>
);

/* -------------------- Filter Modal -------------------- */
const FilterModal = ({ open, onClose }) => {

    const [fromTime, setFromTime] = useState(null);
    const [toTime, setToTime] = useState(null);

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={false}  // removes width constraint
            sx={{
                alignItems: "flex-start", // aligns the dialog to the top
            }}
            PaperProps={{
                sx: {
                    m: 0,          // remove default margin
                    width: "100%", // full width
                    borderRadius: 0, // optional: remove rounded corners
                },
            }}
        >
            <DialogTitle>Filter</DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                            <DateTimePicker
                                label="From Date & Time"
                                value={fromTime}
                                onChange={(newValue) => setFromTime(newValue)}
                                slotProps={{
                                    textField: { fullWidth: true, size: "small" },
                                }}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, md: 4 }}>
                            <DateTimePicker
                                label="To Date & Time"
                                value={toTime}
                                minDateTime={fromTime} // prevents selecting earlier date & time
                                onChange={(newValue) => setToTime(newValue)}
                                slotProps={{
                                    textField: { fullWidth: true, size: "small" },
                                }}
                            />
                        </Grid>
                    </LocalizationProvider>

                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">Time Period Applicable For</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">Company</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">Department</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">Location</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">Region</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">Designation</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 4 }}>
                        <Select fullWidth size="small" displayEmpty>
                            <MenuItem value="">User Status</MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ mt: 4, justifyContent: "center" }}>
                <Button variant="outlined">Clear</Button>
                <Button variant="contained" onClick={onClose}>
                    Search
                </Button>
            </DialogActions>
        </Dialog>
    )

}

const CompletionProgress = ({ value }) => {
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress
                variant="determinate"
                value={value}
                size={40}
                thickness={5}
                sx={{
                    color: value > 0 ? "orange" : "#e0e0e0",
                }}
            />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="caption" component="div">
                    {`${value}%`}
                </Typography>
            </Box>
        </Box>
    );
};

const ProgressLegend = () => {
    const Item = ({ color, label }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: color,
                }}
            />
            <Typography variant="body2">{label}</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", gap: 3 }}>
            <Item color="#D32F2F" label="Not Started Report" />
            <Item color="#FB8C00" label="In Progress Report" />
            <Item color="#2E7D32" label="Completed Report" />
        </Box>
    );
};

/* -------------------- Header -------------------- */
const ReportHeader = ({ title, onFilterClick }) => (
    <Box className="flex justify-between items-center mb-3">
        <Typography variant="h6">{title}</Typography>
        <Box className="flex gap-2">
            <Button variant="outlined" onClick={onFilterClick}>
                Filter
            </Button>
            <Button variant="contained">Export To Excel</Button>
        </Box>
    </Box>
)

const LearnerProgressBar = ({
    notStarted = 0,
    inProgress = 0,
    completed = 0,
}) => {
    const total = notStarted + inProgress + completed;

    const getPercent = (value) =>
        total === 0 ? 0 : (value / total) * 100;

    return (
        <Box
            sx={{
                display: "flex",
                width: "260px",
                height: 10,
                borderRadius: 5,
                overflow: "hidden",
                backgroundColor: "#eee",
            }}
        >
            <Tooltip title={`Not Started: ${notStarted}%`}>
                <Box
                    sx={{
                        width: `${getPercent(notStarted)}%`,
                        backgroundColor: "#D32F2F", // red
                    }}
                />
            </Tooltip>

            <Tooltip title={`In Progress: ${inProgress}%`}>
                <Box
                    sx={{
                        width: `${getPercent(inProgress)}%`,
                        backgroundColor: "#FB8C00", // orange
                    }}
                />
            </Tooltip>

            <Tooltip title={`Completed: ${completed}%`}>
                <Box
                    sx={{
                        width: `${getPercent(completed)}%`,
                        backgroundColor: "#2E7D32", // green
                    }}
                />
            </Tooltip>
        </Box>
    );
};

/* -------------------- Tables -------------------- */
const DashboardTab = ({ onFilterClick, token }) => {
    const [dashboardData, setDashboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/company/dashboard/completion/report`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const value = await response.json();
            if (response.ok) {

                console.log("Value", value?.data);
                

                setDashboardData(value?.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (API_URL && token) fetchDashboardReport();
    }, [API_URL, token]);

    return (
        <>
            <ReportHeader title="Modules" onFilterClick={onFilterClick} />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Module Type</TableCell>
                            <TableCell>
                                Learner Progress Level <ProgressLegend />
                            </TableCell>
                            <TableCell>Total Modules</TableCell>
                            <TableCell>Total Enrolled Modules</TableCell>
                            <TableCell>Module Enrollments</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <TableSkeletonRow key={index} />
                            ))
                        ) : dashboardData.length > 0 ? (
                            dashboardData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item?.moduleTypeName || "-"}</TableCell>
                                    <TableCell>
                                        <LearnerProgressBar
                                            notStarted={Number(item?.notStartedPercent || 0)}
                                            inProgress={Number(item?.inProgressPercent || 0)}
                                            completed={Number(item?.completedPercent || 0)}
                                        />
                                    </TableCell>
                                    <TableCell>{item?.totalModules || 0}</TableCell>
                                    <TableCell>{item?.totalEnrolledModules || 0}</TableCell>
                                    <TableCell>{item?.moduleEnrollments || 0}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};


const ByLearnerAttributesTab = ({ onFilterClick }) => (
    <>
        <ReportHeader
            title="Completion Ratio By Company"
            onFilterClick={onFilterClick}
        />
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell># Learners</TableCell>
                        <TableCell>Modules Count</TableCell>
                        <TableCell>Completion Ratio</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>MG Bakers Pvt Ltd</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>7</TableCell>
                        <TableCell><CompletionProgress value={40} /></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
)

const ByLearningProgramTab = ({ onFilterClick }) => (
    <>
        <ReportHeader
            title="Completion Ratio By Learning Programs"
            onFilterClick={onFilterClick}
        />
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Program</TableCell>
                        <TableCell># Modules</TableCell>
                        <TableCell>Completion Ratio</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Employee Training Program</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell><CompletionProgress value={67} /></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
)

const ByLearnerTab = ({ onFilterClick }) => (
    <>
        <ReportHeader
            title="Completion Data For All Learners"
            onFilterClick={onFilterClick}
        />
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>User Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell># Modules</TableCell>
                        <TableCell>Completion</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Location</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Priya Kumar</TableCell>
                        <TableCell>mg1@gmail.com</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>7</TableCell>
                        <TableCell><CompletionProgress value={43} /></TableCell>
                        <TableCell>MG Bakers</TableCell>
                        <TableCell>India</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
)

const ByModuleTab = ({ onFilterClick }) => (
    <>
        <Box className="flex justify-between items-center mb-4">
            <Box className="flex gap-2 items-center">
                <i className="tabler-report" />
                <TextField size="small" placeholder="Search for Modules" />
            </Box>
            <Button variant="outlined" onClick={onFilterClick}>
                Filter
            </Button>
        </Box>

        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Module Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Enrollments</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Safety Training</TableCell>
                        <TableCell>Micro-learning</TableCell>
                        <TableCell>13</TableCell>
                        <TableCell>In Progress</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
)

/* -------------------- Main Component -------------------- */
const CompletionRatioReport = () => {

    const { data: session } = useSession()
    const token = session?.user?.token

    const [tab, setTab] = useState("dashboard")
    const [openFilter, setOpenFilter] = useState(false)

    return (
        <>
            <TabContext value={tab}>
                <TabList onChange={(e, v) => setTab(v)} variant="scrollable">
                    <Tab label="Dashboard" value="dashboard" />
                    <Tab label="By Learner Attributes" value="by_learner_attribute" />
                    <Tab label="By Learning Programs" value="by_learning_program" />
                    <Tab label="By Learner" value="by_learner" />
                    <Tab label="By Modules" value="by_module" />
                </TabList>

                <Box className="mt-4">
                    <TabPanel value="dashboard" className="p-0">
                        <DashboardTab onFilterClick={() => setOpenFilter(true)} token={token} />
                    </TabPanel>

                    <TabPanel value="by_learner_attribute" className="p-0">
                        <ByLearnerAttributesTab
                            onFilterClick={() => setOpenFilter(true)}
                            token={token}
                        />
                    </TabPanel>

                    <TabPanel value="by_learning_program" className="p-0">
                        <ByLearningProgramTab
                            onFilterClick={() => setOpenFilter(true)}
                            token={token}
                        />
                    </TabPanel>

                    <TabPanel value="by_learner" className="p-0">
                        <ByLearnerTab onFilterClick={() => setOpenFilter(true)} token={token} />
                    </TabPanel>

                    <TabPanel value="by_module" className="p-0">
                        <ByModuleTab onFilterClick={() => setOpenFilter(true)} token={token} />
                    </TabPanel>
                </Box>
            </TabContext>
            <FilterModal
                open={openFilter}
                token={token}
                onClose={() => setOpenFilter(false)}
            />
        </>
    )
}

export default CompletionRatioReport
