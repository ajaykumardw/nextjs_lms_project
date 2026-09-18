"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Box,
    Container,
    Card,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Chip,
    Skeleton,
    Alert,
    Snackbar
} from '@mui/material';
import Link from 'next/link';
import PermissionGuard from '@/hocs/PermissionClientGuard';
import { useApi } from '@/hooks/useApi';

const AttendanceManagementPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready, apiGet, apiPut, apiPost } = useApi();

    const batchId = params?.bId;
    const sessionId = params?.sId;
    const lang = params?.lang;
    const page = Number(searchParams?.get('page')) || 1;
    const search = searchParams?.get('search') || '';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snack, setSnack] = useState('');
    const [savingId, setSavingId] = useState(null);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const qs = new URLSearchParams({ page: String(page), search }).toString();
            const result = await apiGet(`/user/trainer/batches/${batchId}/sessions/${sessionId}/attendance?${qs}`);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ready || !batchId || !sessionId) return;
        fetchAttendance();
    }, [ready, batchId, sessionId, page, search]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const value = new FormData(e.target).get('search') || '';
        const qs = new URLSearchParams({ page: '1', search: value }).toString();
        router.push(`?${qs}`);
    };

    const setLearnerStatus = async (learnerId, status) => {
        try {
            setSavingId(learnerId);
            await apiPut(`/user/trainer/batches/${batchId}/sessions/${sessionId}/attendance/${learnerId}`, { status });
            setData((prev) => ({
                ...prev,
                learners: prev.learners.map((l) => (l.id === learnerId ? { ...l, status } : l)),
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingId(null);
        }
    };

    const markAllPresent = async () => {
        try {
            await apiPost(`/user/trainer/batches/${batchId}/sessions/${sessionId}/attendance/mark-all-present`, {});
            setSnack('All learners marked present');
            fetchAttendance();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <PermissionGuard element={"isUser"} locale={lang}>

            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="xl">

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Button
                        component={Link}
                        variant='outlined'
                        href={`/${lang}/apps/batch-session`}
                        startIcon={<i className="tabler-arrow-left text-lg" />}
                        sx={{ textTransform: 'none', mb: 3, fontWeight: 600 }}
                    >
                        Back to Dashboard
                    </Button>

                    <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
                            <div>
                                <Chip label="Session Attendance & Roster" color="success" size="small" sx={{ mb: 1 }} />
                                <Typography variant="h5" fontWeight="700">Session Attendance</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Batch Strength: <b>{data?.totalLearners?.toLocaleString() ?? '—'} Learners</b> (Showing page {page} of {data?.totalPages ?? 1})
                                </Typography>
                            </div>

                            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' } }}>
                                <Button variant="outlined" onClick={markAllPresent} sx={{ whiteSpace: 'nowrap' }}>
                                    Mark All Present
                                </Button>
                                <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: '350px' } }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search learner by name or email..."
                                        fullWidth
                                        defaultValue={search}
                                        name="search"
                                        InputProps={{ sx: { borderRadius: 2 } }}
                                    />
                                    <Button type="submit" variant="contained" sx={{ borderRadius: 2, minWidth: '45px' }}>
                                        <i className="tabler-search text-lg" />
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        {loading ? (
                            <Skeleton variant="rounded" height={300} sx={{ mb: 3 }} />
                        ) : (
                            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'background.default' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Learner Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Corporate Email</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Attendance Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.learners || []).map((learner) => (
                                            <TableRow key={learner.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="700">{learner.name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">{learner.email}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={learner.status}
                                                        size="small"
                                                        color={learner.status === 'present' ? 'success' : learner.status === 'absent' ? 'error' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'right' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            disabled={savingId === learner.id}
                                                            variant={learner.status === 'present' ? 'contained' : 'outlined'}
                                                            color="success"
                                                            onClick={() => setLearnerStatus(learner.id, 'present')}
                                                        >
                                                            Present
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            disabled={savingId === learner.id}
                                                            variant={learner.status === 'absent' ? 'contained' : 'outlined'}
                                                            color="error"
                                                            onClick={() => setLearnerStatus(learner.id, 'absent')}
                                                        >
                                                            Absent
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Managing large cohorts securely via paginated database queries.
                            </Typography>
                            <Pagination
                                count={data?.totalPages || 1}
                                page={page}
                                color="primary"
                                shape="rounded"
                                onChange={(e, value) => {
                                    const qs = new URLSearchParams({ page: String(value), search }).toString();
                                    router.push(`?${qs}`);
                                }}
                            />
                        </Box>

                    </Card>

                </Container>
            </Box>

            <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
        </PermissionGuard>
    );
};

export default AttendanceManagementPage;
