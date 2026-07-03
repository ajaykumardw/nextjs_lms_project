'use client'

import Grid from '@mui/material/Grid2'
import { Card, Skeleton, Button } from '@mui/material'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

const sessions = [
    { title: 'Live React Class', date: '22 Mar', time: '10:00 AM' },
    { title: 'ILT Session', date: '23 Mar', time: '2:00 PM' }
]

const CARD_HEIGHT = 260

const ProgressSection = ({ dashboardData, loading }) => {
    return (
        <Grid container spacing={6} alignItems="stretch">

            {/* Progress */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        inlineSize: '100%',
                        blockSize: '100%',
                        p: 3,
                        borderRadius: 5,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 1,
                        transition: '.3s',

                        '&:hover': {
                            boxShadow: 8,
                            transform: 'translateY(-4px)'
                        }
                    }}
                >
                    {loading ? (
                        <>
                            <Skeleton width={180} height={30} />
                            <Skeleton width={100} height={60} />
                            <Skeleton
                                variant="rounded"
                                height={10}
                                sx={{ borderRadius: 5 }}
                            />
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                color="text.secondary"
                            >
                                Overall Progress
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 48,
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    mb: 2
                                }}
                            >
                                {Number(
                                    dashboardData?.progressStatus?.completed_percentage ?? 0
                                ).toFixed(1)}
                                %
                            </Typography>

                            <LinearProgress
                                variant="determinate"
                                value={Number(
                                    dashboardData?.progressStatus?.completed_percentage ?? 0
                                )}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    mb: 3
                                }}
                            />

                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 3
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Completed
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            {dashboardData?.progressStatus?.completed ?? 0}
                                        </Typography>
                                    </Card>
                                </Grid>

                                <Grid size={6}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 3
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Remaining
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            {(dashboardData?.progressStatus?.not_started ?? 0) +
                                                (dashboardData?.progressStatus?.in_progress ??
                                                    0)}
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Card>
            </Grid>

            {/* Upcoming Sessions */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>

                <Card
                    sx={{
                        inlineSize: '100%',
                        blockSize: '100%',
                        p: 3,
                        borderRadius: 5,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 1,
                        transition: '.3s',

                        '&:hover': {
                            boxShadow: 8,
                            transform: 'translateY(-4px)'
                        }
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={3}
                    >
                        Upcoming Sessions
                    </Typography>

                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <Skeleton
                                key={i}
                                height={75}
                                sx={{ mb: 2, borderRadius: 3 }}
                            />
                        ))
                    ) : dashboardData?.liveSession?.length ? (
                        dashboardData.liveSession.map((s, i) => (
                            <Card
                                key={i}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    mb: 2,
                                    transition: '.2s',

                                    '&:hover': {
                                        bgcolor: 'action.hover'
                                    }
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <Typography
                                            fontWeight={600}
                                            gutterBottom
                                        >
                                            {s.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {s.start_live_time}
                                        </Typography>
                                    </div>

                                    <Button
                                        variant="contained"
                                        size="small"
                                    >
                                        Join
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Typography color="text.secondary">
                            No upcoming sessions
                        </Typography>
                    )}
                </Card>
            </Grid>
        </Grid>
    )
}

export default ProgressSection
