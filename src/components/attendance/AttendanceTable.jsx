"use client";

import {
    Paper,
    Typography,
    Box,
    TextField,
    MenuItem,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

const rows = [
    {
        name: "Anna Radar",
        course: "Course A",
        session: "03/06/23 - 12:00 PM",
        trainer: "Anna Holizzi",
        method: "Manual",
        status: "Present",
    },
    {
        name: "Hatha Rhnan",
        course: "Batch B",
        session: "03/06/23 - 01:00 PM",
        trainer: "Banna Siman",
        method: "QR Code",
        status: "Absent",
    },
    {
        name: "Sidian Milan",
        course: "Course C",
        session: "03/06/23 - 12:00 PM",
        trainer: "Banna Siman",
        method: "QR Code",
        status: "Late",
    },
    {
        name: "Saram Aman",
        course: "Batch D",
        session: "03/06/23 - 12:00 PM",
        trainer: "Sorian Dmit",
        method: "Virtual",
        status: "Excused",
    },
];

const statusColor = {
    Present: "success",
    Absent: "error",
    Late: "warning",
    Excused: "info",
};

export default function AttendanceTable() {
    return (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box
                display="flex"
                justifyContent="space-between"
                mb={3}
                alignItems="center"
            >
                <Typography variant="h6" fontWeight={700}>
                    Session Attendance Log
                </Typography>

                <Box display="flex" gap={2}>
                    <TextField
                        select
                        size="small"
                        defaultValue="all"
                        sx={{ width: 120 }}
                    >
                        <MenuItem value="all">Filters</MenuItem>
                    </TextField>

                    <TextField size="small" placeholder="Search..." />
                </Box>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Learner</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Session</TableCell>
                            <TableCell>Trainer</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Remarks</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.name}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar>{row.name[0]}</Avatar>
                                        {row.name}
                                    </Box>
                                </TableCell>

                                <TableCell>{row.course}</TableCell>

                                <TableCell>{row.session}</TableCell>

                                <TableCell>{row.trainer}</TableCell>

                                <TableCell>{row.method}</TableCell>

                                <TableCell>
                                    <Chip
                                        label={row.status}
                                        color={statusColor[row.status]}
                                        size="small"
                                    />
                                </TableCell>

                                <TableCell>
                                    <Typography
                                        color="primary"
                                        sx={{ cursor: "pointer", fontWeight: 500 }}
                                    >
                                        View/Add
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
