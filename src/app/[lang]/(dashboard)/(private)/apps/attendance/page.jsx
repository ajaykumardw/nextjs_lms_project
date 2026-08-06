import {
    Box,
    Paper,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import Header from "@components/attendance/Header";
import StatsCard from "@components/attendance/StatsCard";
import AttendanceChart from "@components/attendance/AttendanceChart";
import AttendanceTable from "@components/attendance/AttendanceTable";
import QuickActions from "@components/attendance/QuickActions";
import RightSidebar from "@components/attendance/RightSidebar";

export default function AttendancePage() {
    return (
        <Box sx={{ p: 3, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
            <Header />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatsCard
                                title="Total Learners"
                                value="1,250"
                                icon={<i className="tabler-users" />}
                                color={"white"}
                                bgColor="#1976d2"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatsCard
                                title="Present Today"
                                value="980"
                                icon={<i className="tabler-circle-check" />}
                                color="white"
                                bgColor="#4caf50"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatsCard
                                title="Absent Today"
                                value="150"
                                icon={<i className="tabler-x" />}
                                color="white"
                                bgColor="#ef5350"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatsCard
                                title="Late Arrivals"
                                value="120"
                                icon={<i className="tabler-clock-hour-4" />}
                                color="white"
                                bgColor="#ff9800"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} mt={1}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <AttendanceChart />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <QuickActions />
                        </Grid>
                    </Grid>

                    <Box mt={3}>
                        <AttendanceTable />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <RightSidebar />
                </Grid>
            </Grid>
        </Box>
    );
}
