'use client'

import React, { useState, useEffect } from 'react';

import { useSession } from "next-auth/react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    Paper,
    Button,
    Dialog,
    Skeleton,
    Pagination,
    DialogContent,
    TextField,
    Badge,
    Tabs,
    Tab,
    Divider,
    useTheme,
    Tooltip
} from '@mui/material';

import Grid from '@mui/material/Grid2';

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

export default function MultiContestDashboardUnified() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const assert_url = process.env.NEXT_PUBLIC_ASSETS_URL || ''

    const { data: session } = useSession();
    const token = session?.user?.token;

    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRules, setShowRules] = useState(false);

    const [data, setData] = useState();

    const fetchContestBadgeData = async () => {
        try {

            setLoading(true)

            const response = await fetch(`${API_URL}/user/contest-badge/data`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response.json()

            if (response.ok) {

                const value = result?.data;

                console.log("Value", value)

                setData(value)

            }

        } catch (error) {
            throw new error(error)
        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {
        if (API_URL && token) {

            fetchContestBadgeData()
        }
    }, [API_URL, token])

    const currentContest = data?.contest_badge?.[activeTab];

    const filteredRankings = currentContest?.leaderboard?.filter(item => {
        const fullName =
            `${item?.first_name || ''} ${item?.last_name || ''}`.toLowerCase();

        return fullName.includes(searchQuery.toLowerCase());
    });

    const [page, setPage] = useState(1)

    const rowsPerPage = 10

    const paginatedRankings = filteredRankings?.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    )

    const totalPages = Math.ceil((filteredRankings?.length || 0) / rowsPerPage)

    useEffect(() => {
        setPage(1)
    }, [filteredRankings])

    const statusConfig = {
        Live: {
            color: '#10b981' // green
        },
        Upcoming: {
            color: '#3b82f6' // blue
        },
        'Result Processing': {
            color: '#f59e0b' // amber
        },
        'Result Announced': {
            color: '#8b5cf6' // purple
        }
    }

    const statusColor =
        statusConfig[currentContest?.contest_status]?.color || '#6b7280'

    if (loading) {
        return (
            <Box p={4}>
                <Skeleton variant="rounded" height={50} sx={{ mb: 3 }} />

                <Skeleton
                    variant="rounded"
                    height={140}
                    sx={{ mb: 4, borderRadius: 4 }}
                />

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Skeleton
                            variant="rounded"
                            height={380}
                            sx={{ borderRadius: 4 }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Skeleton
                            variant="rounded"
                            height={380}
                            sx={{ borderRadius: 4 }}
                        />
                    </Grid>

                    <Grid size={12}>
                        <Skeleton
                            variant="rounded"
                            height={500}
                            sx={{ borderRadius: 4 }}
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{
            bgcolor: isDark ? '#0f172a' : '#f8fafc',
            minHeight: '100vh',
            p: { xs: 2, md: 4 },
            color: 'text.primary',
            transition: 'background-color 0.3s, color 0.3s',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>

            {/* Top Bar Navigation & Adaptive Actions */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={3} mb={4}>
                <Box>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => { setActiveTab(v); setSearchQuery(''); }}
                        sx={{
                            minHeight: '44px',
                            '& .MuiTabs-indicator': {
                                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                                height: 3,
                                borderRadius: '3px'
                            },
                            '& .MuiTab-root': {
                                color: 'text.secondary',
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1.05rem',
                                px: 3,
                                minHeight: '44px',
                                transition: 'color 0.2s'
                            },
                            '& .Mui-selected': { color: '#2563eb !important' }
                        }}
                    >

                        {data?.contest_badge?.map((contest) => (
                            <Tab key={contest._id} label={contest.contest_name} />
                        ))}
                    </Tabs>
                    <Typography
                        variant="caption"
                        sx={{
                            color: statusColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1.5,
                            pl: 3,
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        <Box
                            sx={{
                                width: 6,
                                height: 6,
                                bgcolor: statusColor,
                                borderRadius: '50%',
                                animation:
                                    currentContest?.contest_status === 'Live'
                                        ? 'pulse 2s infinite'
                                        : 'none'
                            }}
                        />
                        {currentContest?.contest_status} • {currentContest?.badge_enroll?.length}
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <TextField
                        id="leaderboard-search"
                        size="small"
                        placeholder="Search learner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: '10px',
                            width: { xs: '100%', sm: 240 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                                '&:hover fieldset': { borderColor: '#2563eb' },
                                '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '2px' }
                            }
                        }}
                    />
                    <Paper elevation={0} sx={{
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        bgcolor: 'background.paper',
                        p: '6px 16px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: 'center'
                    }}>
                        <Box>
                            <Typography sx={{ color: '#f97316', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', tracking: 1 }}>Time Remaining</Typography>
                            <Typography sx={{ color: 'text.primary', fontSize: '14px', fontWeight: 800, fontFamily: 'monospace' }}>{currentContest?.remainingTime}</Typography>
                        </Box>
                    </Paper>
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={() => setShowRules(true)}
                        sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            color: 'text.primary',
                            textTransform: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            px: 2.5,
                            py: 1,
                            width: { xs: '100%', sm: 'auto' },
                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderColor: '#2563eb' }
                        }}
                    >
                        Contest Rules
                    </Button>
                </Stack>
            </Box>

            {/* Welcome User Banner */}
            <Card sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderRadius: '20px',
                mb: 4,
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.02)',
                background: isDark ? 'linear-gradient(145deg, #1e293b, #0f172a)' : '#fff',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <CardContent sx={{ p: '28px !important' }}>
                    <Grid container spacing={4} alignItems="center" justifyContent="space-between">
                        <Grid size={{ xs: 12, lg: 7 }} display="flex" alignItems="center" gap={3}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                p: '14px 22px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
                            }}
                            >
                                <Typography variant="caption" sx={{ color: '#93c5fd', display: 'block', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', tracking: 0.5 }}>Rank</Typography>
                                <Typography variant="h4" fontWeight="900" sx={{ color: '#fff', lineHeight: 1.1 }}>{currentContest?.currentUser?.rank}</Typography>
                            </Box>
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
                                        Welcome back, {currentContest?.currentUser?.first_name} {currentContest?.currentUser?.last_name}
                                    </Typography>
                                    <Box sx={{ bgcolor: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#2563eb', px: 1.5, py: 0.4, borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: '1px solid', borderColor: isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe' }}>Active Session</Box>
                                </Stack>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        mt: 1,
                                        fontWeight: 500,
                                        lineHeight: 1.5
                                    }}
                                >
                                    {currentContest?.currentUser?.rank === 1 ? (
                                        <>
                                            You are currently leading the contest. Keep earning points to
                                            maintain your position.
                                        </>
                                    ) : (
                                        <>
                                            You are currently lagging by just{' '}
                                            <span
                                                style={{
                                                    color: '#2563eb',
                                                    fontWeight: 700,
                                                    borderBottom: '1px dashed #2563eb'
                                                }}
                                            >
                                                {currentContest?.nextUser?.totalPoints - currentContest?.currentUser?.totalPoints} points
                                            </span>{' '}
                                            behind rank #{currentContest?.currentUser?.rank - 1} (
                                            {currentContest?.nextUser?.first_name}{' '}
                                            {currentContest?.nextUser?.last_name}). Complete an
                                            exercise to level up.
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 'auto' }} display="flex" gap={2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
                            <Box sx={{ flex: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', p: '14px 24px', borderRadius: '14px', minWidth: 140, textAlign: { xs: 'left', lg: 'right' } }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, tracking: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: '10px' }}>Contest Points</Typography>
                                <Typography variant="h5" fontWeight="900" sx={{ color: 'text.primary' }}>{currentContest?.currentUser?.totalPoints} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>PTS</span></Typography>
                            </Box>
                            <Box sx={{ flex: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', p: '14px 24px', borderRadius: '14px', minWidth: 140, textAlign: { xs: 'left', lg: 'right' } }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, tracking: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: '10px' }}>Badges Earned</Typography>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mt: 0.5, border: '1px solid', borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0', bgcolor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', px: 1.5, py: 0.4, borderRadius: '20px' }}>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: isDark ? '#34d399' : '#047857', fontSize: '13px' }}>{currentContest?.badge_earned?.length} Badges</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Main Visual Panels Layer */}
            <Grid container spacing={4} mb={4}>

                {/* Left Side Panel - Structural Podium Frame */}
                <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                    <Card sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        borderRadius: '20px',
                        height: 380,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        p: 4,
                        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.02)'
                    }}>
                        <Box display="flex" alignItems="flex-end" gap={{ xs: 1.5, sm: 4 }} width="100%" justifyContent="center">

                            {/* RANK 2 */}
                            <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: { xs: 100, sm: 140 } }}>
                                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                    <Badge badgeContent={2} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { bgcolor: '#94a3b8', color: '#fff', fontWeight: 800, width: 20, height: 20, minWidth: 20, fontSize: '11px' } }}>
                                        <Avatar sx={{ bgcolor: isDark ? '#334155' : '#f1f5f9', color: 'text.secondary', width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, fontWeight: 700, fontSize: '18px', border: '2px solid', borderColor: '#cbd5e1' }}>{currentContest?.leaderboard?.[1].first_name?.[0] + " " + currentContest?.leaderboard?.[1].last_name?.[0]}</Avatar>
                                    </Badge>
                                    <Typography variant="body2" fontWeight="700" sx={{ color: 'text.primary', mt: 1, fontSize: { xs: '12px', sm: '14px' }, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{currentContest?.leaderboard?.[1].first_name} {currentContest?.leaderboard?.[1].last_name}</Typography>
                                </Box>
                                <Box sx={{
                                    width: '100%',
                                    height: 120,
                                    background: isDark ? 'linear-gradient(180deg, rgba(148,163,184,0.1) 0%, rgba(148,163,184,0.02) 100%)' : 'linear-gradient(180deg, #f1f5f9 0%, rgba(241,245,249,0.2) 100%)',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(148,163,184,0.2)' : '#e2e8f0',
                                    borderBottom: 'none',
                                    borderRadius: '12px 12px 0 0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5
                                }}>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: 'text.primary', fontSize: { xs: '12px', sm: '14px' } }}>{0} pts</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 600 }}>🎖️ {currentContest?.podium?.rank2?.badges}</Typography>
                                </Box>
                            </Box>

                            {/* RANK 1 */}
                            <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: { xs: 110, sm: 160 }, zIndex: 2 }}>
                                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                    <Badge badgeContent={"👑"} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ '& .MuiBadge-badge': { top: -10, fontSize: '20px', bgcolor: 'transparent' } }}>
                                        <Badge badgeContent={1} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { bgcolor: '#eab308', color: '#000', fontWeight: 900, width: 22, height: 22, minWidth: 22, fontSize: '12px', boxShadow: '0 2px 8px rgba(234,179,8,0.4)' } }}>
                                            <Avatar sx={{ bgcolor: isDark ? 'rgba(234,179,8,0.15)' : '#fef9c3', color: '#ca8a04', width: { xs: 65, sm: 76 }, height: { xs: 65, sm: 76 }, fontWeight: 800, fontSize: '24px', border: '3px solid #facc15', boxShadow: '0 8px 24px rgba(234,179,8,0.2)' }}>{currentContest?.leaderboard?.[0]?.first_name?.[0] + " " + currentContest?.leaderboard?.[0]?.last_name?.[0]}</Avatar>
                                        </Badge>
                                    </Badge>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: '#ca8a04', mt: 1, fontSize: { xs: '13px', sm: '15px' }, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{currentContest?.leaderboard?.[0]?.first_name} {currentContest?.leaderboard?.[0]?.last_name}</Typography>
                                </Box>
                                {
                                    currentContest?.leaderboard?.[0] && (

                                        <Box sx={{
                                            width: '100%',
                                            height: 160,
                                            background: isDark ? 'linear-gradient(180deg, rgba(234,179,8,0.12) 0%, rgba(234,179,8,0.01) 100%)' : 'linear-gradient(180deg, #fef9c3 0%, rgba(254,249,195,0.2) 100%)',
                                            border: '1px solid rgba(250,204,21,0.4)',
                                            borderBottom: 'none',
                                            borderRadius: '14px 14px 0 0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 0.5,
                                            boxShadow: '0 -4px 20px rgba(234,179,8,0.05)'
                                        }}>
                                            <Typography variant="body1" fontWeight="900" sx={{ color: 'text.primary', fontSize: { xs: '14px', sm: '16px' } }}>{currentContest?.leaderboard?.[0]?.totalPoints} pts</Typography>
                                            <Box sx={{ color: '#ca8a04', fontSize: '11px', fontWeight: 700, bgcolor: isDark ? 'rgba(234,179,8,0.15)' : '#fff', px: 1, py: 0.2, borderRadius: '6px', border: '1px solid rgba(250,204,21,0.2)' }}>🏆 {0}</Box>
                                        </Box>
                                    )
                                }
                            </Box>

                            {/* RANK 3 */}
                            <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: { xs: 100, sm: 140 } }}>
                                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                    <Badge badgeContent={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { bgcolor: '#ea580c', color: '#fff', fontWeight: 800, width: 20, height: 20, minWidth: 20, fontSize: '11px' } }}>
                                        <Avatar sx={{ bgcolor: isDark ? 'rgba(234,88,12,0.1)' : '#ffedd5', color: '#ea580c', width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, fontWeight: 700, fontSize: '18px', border: '2px solid rgba(234,88,12,0.3)' }}>{currentContest?.leaderboard?.[2]?.first_name?.[0] + " " + currentContest?.leaderboard?.[2]?.last_name?.[0]}</Avatar>
                                    </Badge>
                                    <Typography variant="body2" fontWeight="700" sx={{ color: 'text.primary', mt: 1, fontSize: { xs: '12px', sm: '14px' }, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{currentContest?.leaderboard?.[2]?.first_name} {currentContest?.leaderboard?.[2]?.last_name}</Typography>
                                </Box>
                                <Box sx={{
                                    width: '100%',
                                    height: 100,
                                    background: isDark ? 'linear-gradient(180deg, rgba(234,88,12,0.08) 0%, rgba(234,88,12,0.01) 100%)' : 'linear-gradient(180deg, #ffedd5 0%, rgba(255,237,213,0.2) 100%)',
                                    border: '1px solid rgba(234,88,12,0.2)',
                                    borderBottom: 'none',
                                    borderRadius: '12px 12px 0 0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5
                                }}>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: 'text.primary', fontSize: { xs: '12px', sm: '14px' } }}>{currentContest?.leaderboard?.[2]?.totalPoints} pts</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 600 }}>🎖️ {currentContest?.podium?.rank3?.badges}</Typography>
                                </Box>
                            </Box>

                        </Box>
                    </Card>
                </Grid>

                {/* Right Side Panel - Dynamic Event Badges Dashboard */}
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <Card sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        borderRadius: '20px',
                        height: 380,
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.02)'
                    }}>
                        <Box>
                            <Typography variant="body2" fontWeight="800" sx={{ color: 'text.secondary', textTransform: 'uppercase', tracking: 1, fontSize: '11px', mb: 2 }}>
                                Your Earned Event Badges
                            </Typography>

                            <Stack
                                spacing={1.2}
                                sx={{
                                    overflowY: 'auto',
                                    pr: 0.5,
                                    '&::-webkit-scrollbar': {
                                        width: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: isDark
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'rgba(0,0,0,0.1)',
                                        borderRadius: '4px'
                                    }
                                }}
                            >
                                {currentContest?.badge_earned?.length > 0 ? (
                                    currentContest.badge_earned.map((badgeItem) => (
                                        <Tooltip
                                            key={badgeItem?.badge_detail?._id}
                                            title={`Criteria: ${badgeItem?.badge_detail?.criteria}`}
                                            arrow
                                            placement="left"
                                        >
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 1.2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    bgcolor: badgeItem.bg,
                                                    border: '1px solid',
                                                    borderColor: badgeItem.border,
                                                    borderRadius: '12px',
                                                    cursor: 'help',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateX(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                                    }
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Box
                                                        component="img"
                                                        src={`${assert_url}/badges/${badgeItem?.badge_detail?.logo_url}`}
                                                        alt={badgeItem?.badge_detail?.title}
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            objectFit: 'contain',
                                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                                        }}
                                                    />

                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={700}
                                                            sx={{
                                                                color: 'text.primary',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            {badgeItem?.badge_detail?.title}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                display: 'block',
                                                                fontSize: '11px',
                                                                mt: 0.1
                                                            }}
                                                        >
                                                            {badgeItem?.badge_detail?.winner}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: badgeItem?.badge_detail?.color,
                                                        color: '#fff',
                                                        px: 1.2,
                                                        py: 0.4,
                                                        borderRadius: '6px',
                                                        fontSize: '9px',
                                                        fontWeight: 900,
                                                        letterSpacing: 0.5
                                                    }}
                                                >
                                                    UNLOCKED
                                                </Paper>
                                            </Paper>
                                        </Tooltip>
                                    ))
                                ) : (
                                    <Box
                                        sx={{
                                            height: 220,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight={700}>
                                            No Badges Found
                                        </Typography>
                                        <Typography variant="body2">
                                            Participate in events to earn badges.
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>

                        <Box sx={{ borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', pt: 2 }}>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', display: 'block', fontSize: '10px' }}>Total Event Points</Typography>
                                    <Typography variant="h6" fontWeight="900" sx={{ color: '#2563eb', lineHeight: 1.2 }}>{currentContest?.currentUser?.totalPoints}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', display: 'block', fontSize: '10px' }}>Tie-Breaker Metrics</Typography>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: 'text.primary', fontSize: '12px' }}>Badge Hierarchy Active</Typography>
                                </Box>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Standings Table Layout */}
            <Paper
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    backgroundImage: 'none',
                    boxShadow: isDark
                        ? '0 10px 30px rgba(0,0,0,0.2)'
                        : '0 10px 30px rgba(0,0,0,0.02)'
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: '18px 32px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                        borderBottom: '1px solid',
                        borderColor: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.06)'
                    }}
                    display="flex"
                    justifyContent="space-between"
                >
                    <Box display="flex" gap={4} width="50%">
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 800,
                                width: 50,
                                textTransform: 'uppercase',
                                fontSize: '11px'
                            }}
                        >
                            Rank
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                fontSize: '11px'
                            }}
                        >
                            Learner Name
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        width="40%"
                        sx={{ textAlign: 'right' }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                width: '50%',
                                pr: 4
                            }}
                        >
                            Contest Badges
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                width: '50%'
                            }}
                        >
                            Contest Score
                        </Typography>
                    </Box>
                </Box>

                {/* Rows */}
                <Stack
                    divider={
                        <Divider
                            sx={{
                                borderColor: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(0,0,0,0.06)'
                            }}
                        />
                    }
                >
                    {paginatedRankings?.map((row, index) => (
                        <Box
                            key={row.user_id || index}
                            sx={{
                                p: '16px 32px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                bgcolor: row.isUser
                                    ? isDark
                                        ? 'rgba(37,99,235,0.12)'
                                        : '#f0f9ff'
                                    : 'transparent',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    bgcolor: row.isUser
                                        ? isDark
                                            ? 'rgba(37,99,235,0.18)'
                                            : '#e0f2fe'
                                        : isDark
                                            ? 'rgba(255,255,255,0.02)'
                                            : '#f8fafc'
                                }
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={4}
                                width="50%"
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="800"
                                    sx={{
                                        color:
                                            row?.user_id ===
                                                currentContest?.currentUser?.user_id
                                                ? '#2563eb'
                                                : 'text.secondary',
                                        width: 50,
                                        fontSize: '14px'
                                    }}
                                >
                                    #{row.rank}
                                </Typography>

                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        sx={{
                                            bgcolor: row.avatarBg,
                                            color: '#fff',
                                            width: 36,
                                            height: 36,
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            boxShadow:
                                                '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        {`${row?.first_name?.[0] || ''}${row?.last_name?.[0] || ''}`}
                                    </Avatar>

                                    <Typography
                                        component="div"
                                        variant="body2"
                                        fontWeight="700"
                                        sx={{
                                            color: 'text.primary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}
                                    >
                                        {row.first_name} {row.last_name}

                                        {row?.user_id ===
                                            currentContest?.currentUser?.user_id && (
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        background:
                                                            'linear-gradient(90deg, #2563eb, #3b82f6)',
                                                        color: '#fff',
                                                        px: 1.2,
                                                        py: 0.2,
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: 900,
                                                        letterSpacing: 0.5
                                                    }}
                                                >
                                                    YOU
                                                </Paper>
                                            )}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                width="40%"
                            >
                                <Box
                                    width="50%"
                                    display="flex"
                                    justifyContent="flex-end"
                                    sx={{ pr: 4 }}
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={0.5}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: isDark
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.06)',
                                            bgcolor: 'background.default',
                                            p: '4px 12px',
                                            borderRadius: '8px',
                                            boxShadow:
                                                '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                color: '#ca8a04'
                                            }}
                                        >
                                            🎖️ {row?.badge_earned?.length || 0}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography
                                    variant="body2"
                                    fontWeight="900"
                                    sx={{
                                        color: 'text.primary',
                                        width: '50%',
                                        textAlign: 'right',
                                        fontSize: '14px'
                                    }}
                                >
                                    {row.totalPoints}
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                            fontWeight: 700,
                                            marginLeft: 4
                                        }}
                                    >
                                        PTS
                                    </span>
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>

                {totalPages > 1 && (
                    <Box
                        sx={{
                            py: 3,
                            display: 'flex',
                            justifyContent: 'center',
                            borderTop: '1px solid',
                            borderColor: isDark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(0,0,0,0.06)'
                        }}
                    >
                        <Pagination
                            page={page}
                            count={totalPages}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                            shape="rounded"
                            size="medium"
                        />
                    </Box>
                )}
            </Paper>

            {/* Rules Dialog Window */}
            <Dialog open={showRules} onClose={() => setShowRules(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}>
                <DialogCloseButton onClick={() => setShowRules(false)}><i className="tabler-x" /></DialogCloseButton>
                <DialogContent>
                    <Typography variant="h6" fontWeight="900" letterSpacing="-0.01em" gutterBottom>Scoring Metrics Policy</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>System calculation definitions for the running tracks.</Typography>
                    <Stack spacing={2}>
                        {
                            data?.leaderPoint?.map((lp, lpIndex) =>
                                lp?.label_data?.map((lbd, lbdIndex) => (
                                    <Paper
                                        key={`${lpIndex}-${lbdIndex}`}
                                        sx={{
                                            p: 2,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight="700"
                                            sx={{ color: 'text.primary' }}
                                        >
                                            {lbd?.label}
                                        </Typography>

                                        <Box
                                            sx={{
                                                color: '#2563eb',
                                                fontWeight: 800,
                                                bgcolor: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: '8px',
                                                border: '1px solid rgba(37,99,235,0.15)',
                                                fontSize: '13px'
                                            }}
                                        >
                                            {Number(lbd?.value) >= 0 ? ("+" + lbd?.value) : (lbd?.value)} Pts
                                        </Box>
                                    </Paper>
                                ))
                            )
                        }
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
