'use client'

import Grid from '@mui/material/Grid2'
import StatCard from "@/components/StatCard";

const data = [
    { title: 'Enrolled Module', stats: '12', color: 'primary', icon: 'tabler-book' },
    { title: 'In Progress', stats: '5', color: 'warning', icon: 'tabler-clock' },
    { title: 'Completed', stats: '7', color: 'success', icon: 'tabler-check' },
    { title: 'Not Started', stats: '3', color: 'info', icon: 'tabler-player-pause' }
]

const TopStats = () => {
    return (
        <Grid container spacing={6}>
            {data.map((item, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard {...item} />
                </Grid>
            ))}
        </Grid>
    )
}

export default TopStats
