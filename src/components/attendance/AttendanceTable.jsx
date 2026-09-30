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
    TablePagination,
} from "@mui/material";

const STATUS_COLOR = { present: "success", absent: "error", late: "warning", pending: "default" };
const METHOD_LABEL = { manual: "Manual", qr: "QR code", biometric: "Biometric", virtual: "Virtual" };
const COLUMNS = ["Learner", "Batch", "Session", "Trainer", "Method", "Status"];

const formatSession = (s) => {
    if (!s) return { title: "-", sub: "" };
    const d = new Date(s.session_date);
    
    const date = isNaN(d)
        ? "-"
        : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
        const time = [s.start_time, s.end_time].filter(Boolean).join(" - ");
    
    return { title: `Session ${s.session_number ?? "-"}`, sub: [date, time].filter(Boolean).join(" · ") };
};

const capitalize = (v = "") => v.charAt(0).toUpperCase() + v.slice(1);

export default function AttendanceTable({ logs, status, loading, onStatusChange, onPageChange, onLimitChange }) {

    const { items = [], page = 1, limit = 10, total = 0 } = logs || {};

    // never let MUI receive a page that is past the last one
    const safePage = Math.min(page - 1, Math.max(0, Math.ceil(total / limit) - 1));

    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                <Typography variant="h6" fontWeight={700}>
                    Session attendance log
                </Typography>

                <TextField
                    select
                    size="small"
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    sx={{ width: 160 }}
                    slotProps={{ htmlInput: { "aria-label": "Filter by status" } }}
                >
                    <MenuItem value="all">All statuses</MenuItem>
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="late">Late</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                </TextField>
            </Box>

            <TableContainer sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .15s" }}>
                <Table sx={{ minWidth: 760 }}>
                    <TableHead>
                        <TableRow>
                            {COLUMNS.map((c) => (
                                <TableCell key={c} sx={{ whiteSpace: "nowrap" }}>
                                    {c}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {items.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                    No attendance records match these filters.
                                </TableCell>
                            </TableRow>
                        )}

                        {items.map((row) => {
                            
                            const session = formatSession(row.session);
                            const st = row.status || "pending";

                            return (
                                <TableRow hover key={row._id}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                                {(row.learner?.name || "?")[0].toUpperCase()}
                                            </Avatar>
                                            <Box minWidth={0}>
                                                <Typography variant="body2" fontWeight={600} noWrap>
                                                    {row.learner?.name || "-"}
                                                </Typography>
                                                {row.learner?.email && (
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        {row.learner.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    <TableCell>{row.batch?.name || "-"}</TableCell>

                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {session.title}
                                        </Typography>
                                        {session.sub && (
                                            <Typography variant="caption" color="text.secondary">
                                                {session.sub}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {row.trainers?.length ? row.trainers.map((t) => t.name).join(", ") : "-"}
                                    </TableCell>

                                    <TableCell>{METHOD_LABEL[row.method] || "Manual"}</TableCell>

                                    <TableCell>
                                        <Chip label={capitalize(st)} color={STATUS_COLOR[st] || "default"} size="small" />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={total}
                page={safePage}
                rowsPerPage={limit}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_, p) => onPageChange(p + 1)}
                onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            />
        </Paper>
    );
}
