'use client'

import { useParams } from 'next/navigation'

import { Skeleton } from '@mui/material';

import Grid from '@mui/material/Grid2'

import StatCard from "@/components/StatCard";


const TopStats = ({ dashboardData, loading }) => {

    const { lang, } = useParams()

    const data = [
        { title: 'Enrolled Module', stats: dashboardData?.enrolledData?.length ?? 0, color: 'primary', icon: 'tabler-book', slug: "enrolled-module", url: `/${lang}/apps/my-modules/enrolled-module` },
        { title: 'In Progress', stats: dashboardData?.progressStatus?.in_progress ?? 0, color: 'warning', icon: 'tabler-clock', slug: "in-progress", url: `/${lang}/apps/my-modules/in-progress` },
        { title: 'Completed', stats: dashboardData?.progressStatus?.completed ?? 0, color: 'success', icon: 'tabler-check', slug: "completed", url: `/${lang}/apps/my-modules/completed` },
        { title: 'Not Started', stats: dashboardData?.progressStatus?.not_started ?? 0, color: 'info', icon: 'tabler-player-pause', slug: "not-started", url: `/${lang}/apps/my-modules/not-started` }
    ]

    return (
        <Grid container spacing={6}>
            {loading ? (
                [...Array(4)].map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Skeleton variant="rounded" height={120} />
                    </Grid>
                ))
            ) : (
                data.map((item, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard {...item} />
                    </Grid>
                ))
            )}
        </Grid>
    )
}

export default TopStats
