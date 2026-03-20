'use client'

import Grid from "@mui/material/Grid2"
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const CARD_HEIGHT = 260

const RecentActivities = () => {
    return (
        <Grid container spacing={6} alignItems="stretch">

            {/* Recent Activities */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        blockSize: CARD_HEIGHT,
                        minHeight: CARD_HEIGHT,
                        maxHeight: CARD_HEIGHT,
                        inlineSize: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Recent Activities" />

                    <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                        <Typography>Watched React Video</Typography>
                        <Typography>Completed Quiz</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Notifications */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Card
                    sx={{
                        blockSize: CARD_HEIGHT,
                        minHeight: CARD_HEIGHT,
                        maxHeight: CARD_HEIGHT,
                        inlineSize: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <CardHeader title="Notifications" />

                    <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                        <Typography>New course available</Typography>
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    )
}

export default RecentActivities
