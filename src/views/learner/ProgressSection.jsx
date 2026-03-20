'use client'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'

const sessions = [
    { title: 'Live React Class', date: '22 Mar', time: '10:00 AM' },
    { title: 'ILT Session', date: '23 Mar', time: '2:00 PM' }
]

const CARD_HEIGHT = 260

const ProgressSection = () => {
    return (
        <Grid container spacing={6} alignItems="stretch">

            {/* Progress */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        height: CARD_HEIGHT,
                        minHeight: CARD_HEIGHT,
                        maxHeight: CARD_HEIGHT,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardContent sx={{ overflowY: 'auto' }}>
                        <Typography variant="h6">Overall Progress</Typography>
                        <Typography variant="h4">65%</Typography>
                        <LinearProgress variant="determinate" value={65} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Upcoming Sessions */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        height: CARD_HEIGHT,
                        minHeight: CARD_HEIGHT,
                        maxHeight: CARD_HEIGHT,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Upcoming Sessions" />

                    {/* Scrollable content */}
                    <CardContent sx={{ overflowY: 'auto', flex: 1 }}>
                        {sessions.map((s, i) => (
                            <div key={i} className="flex justify-between items-center mb-4">
                                <div>
                                    <Typography>{s.title}</Typography>
                                    <Typography variant="body2">
                                        {s.date} | {s.time}
                                    </Typography>
                                </div>
                                <Button variant="outlined">Join</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default ProgressSection
