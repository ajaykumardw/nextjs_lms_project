'use client'

import { useState } from 'react'

import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Paper,
    Chip,
    Tooltip,
    TextField,
    IconButton,
    InputAdornment,
} from '@mui/material'

import Grid from '@mui/material/Grid2'

export default function LeadershipBoard() {
    const [tab, setTab] = useState(0)

    const user = {
        name: 'Priya Kumar',
        points: 0,
        rank: 1,
        initials: 'PK',
    }

    return (
        <Box p={3}>
            {/* Title */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Leaderboard
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Panel */}
                <Grid item size={{ xs: 12, md: 8 }}>
                    {/* Highlighted User Card */}
                    <Card
                        sx={{
                            background: 'linear-gradient(to right, #fef1f6, #fdf9f6)',
                            mb: 3,
                            boxShadow: 2,
                            borderRadius: 3,
                        }}
                    >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#b91372', inlineSize: 56, blockSize: 56, color: "#fff" }}>
                                {user.initials}
                            </Avatar>
                            <Box>
                                <Typography fontWeight="bold">{user.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    🏅 Rank {user.rank} &nbsp;&nbsp; 🛡️ Points{' '}
                                    <Typography component="span" color="primary" fontWeight="medium">
                                        {user.points}
                                    </Typography>
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Podium Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            backgroundColor: '#fff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        <Grid container spacing={2} className='justify-center items-end'>
                            <Grid size={{ xs: 4 }} className='flex justify-center'>
                                <Avatar className='bg-error -mb-7' style={{ color: "#fff" }}>PK</Avatar>
                            </Grid>
                            <Grid size={{ xs: 4 }} className='flex justify-center'>
                                <Avatar className='bg-error' style={{ color: "#fff" }}>PK</Avatar>
                            </Grid>
                            <Grid size={{ xs: 4 }} className='flex justify-center'>
                                <Avatar className='bg-error -mb-10' style={{ color: "#fff" }}>PK</Avatar>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <div className='rounded w-full min-w-[100px] h-[110px] bg-info'></div>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <div className='rounded w-full min-w-[100px] h-[140px] bg-primary'></div>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <div className='rounded w-full min-w-[100px] h-[100px] bg-warning'></div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Right Panel */}
                <Grid item size={{ xs: 12, md: 4 }}>
                    {/* Search */}
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <TextField
                            size="small"
                            placeholder="Search"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {/* Optional: Add search icon */}
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Tooltip title="Filter">
                            <IconButton>
                                {/* Optional: Add filter icon */}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Rank List */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: 2,
                            mt: 3,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Avatar sx={{ bgcolor: '#b91372', inlineSize: 36, blockSize: 36, color: "#fff" }}>
                            {user.initials}
                        </Avatar>
                        <Box flexGrow={1} minWidth={0}>
                            <Typography fontWeight="bold" noWrap>
                                {user.name}
                            </Typography>
                        </Box>
                        <Typography color="primary" fontWeight="medium" noWrap>
                            {user.points} pts
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
